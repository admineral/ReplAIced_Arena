import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

// Retrieve API keys from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY;

// Ensure API keys are defined
if (!openaiApiKey) {
  throw new Error("Missing OpenAI API key");
}

if (!googleApiKey) {
  throw new Error("Missing Google API key");
}

const openai = new OpenAI({ apiKey: openaiApiKey });
const genAI = new GoogleGenerativeAI(googleApiKey);

export async function POST(req: Request) {
  console.log('Received POST request to /api/ai');

  // Extract and validate the incoming request payload
  const { messages, systemMessage: customSystemMessage, temperature: customTemperature, intendedModel } = await req.json() as { 
    messages: ChatCompletionMessageParam[], 
    systemMessage?: ChatCompletionMessageParam, 
    temperature?: number,
    intendedModel?: string
  };

  console.log(`Intended model: ${intendedModel}`);
  console.log('Request payload:', JSON.stringify({ messages, customSystemMessage, customTemperature, intendedModel }, null, 2));

  // Validate the messages array
  if (!Array.isArray(messages) || messages.some(msg => typeof msg.content !== 'string')) {
    console.error('Invalid messages format');
    return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400 });
  }

  // Set a default system message if not provided
  const defaultSystemMessage: ChatCompletionMessageParam = { role: 'system', content: 'You are a helpful assistant.' };
  const systemMessage = customSystemMessage || defaultSystemMessage;
  const updatedMessages = [systemMessage, ...messages];

  // Set temperature with a default fallback
  const defaultTemperature = 0.7;
  const temperature = customTemperature ?? defaultTemperature;

  try {
    // Choose the appropriate model based on the intendedModel parameter
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

// Function to handle requests using OpenAI
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

// Function to handle requests using Google Gemini
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