import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req: Request) {
  console.log('Received POST request to /api/ai');
  const { messages, systemMessage: customSystemMessage, temperature: customTemperature, intendedModel } = await req.json() as { 
    messages: ChatCompletionMessageParam[], 
    systemMessage?: ChatCompletionMessageParam, 
    temperature?: number,
    intendedModel?: string
  };

  console.log(`Intended model: ${intendedModel}`);
  console.log('Request payload:', JSON.stringify({ messages, customSystemMessage, customTemperature, intendedModel }, null, 2));

  // Validate messages
  if (!Array.isArray(messages) || messages.some(msg => typeof msg.content !== 'string')) {
    console.error('Invalid messages format');
    return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400 });
  }

  // Add a system message
  const defaultSystemMessage: ChatCompletionMessageParam = { role: 'system', content: 'You are a helpful assistant.' };
  const systemMessage = customSystemMessage || defaultSystemMessage;
  const updatedMessages = [systemMessage, ...messages];

  // Set temperature
  const defaultTemperature = 0.7;
  const temperature = customTemperature ?? defaultTemperature;

  try {
    let stream;
    if (intendedModel === 'openai') {
      stream = await handleOpenAI(updatedMessages, temperature);
    } else {
      stream = await handleGemini(updatedMessages, temperature);
    }

    console.log('Returning streaming response');
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error occurred:', error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }), { status: 500 });
  }
}

async function handleOpenAI(messages: ChatCompletionMessageParam[], temperature: number) {
  console.log('Sending request to OpenAI API');
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
    temperature,
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    }
  });
}

async function handleGemini(messages: ChatCompletionMessageParam[], temperature: number) {
  console.log('Sending request to Gemini API');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const chat = model.startChat({
    history: messages.slice(1).map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })),
    generationConfig: { temperature },
  });

  const result = await chat.sendMessageStream(messages[messages.length - 1].content);

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of result.stream) {
        controller.enqueue(encoder.encode(chunk.text()));
      }
      controller.close();
    }
  });
}