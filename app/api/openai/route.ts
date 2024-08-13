import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

const openaiApiKey = process.env.OPENAI_API_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY;

if (!openaiApiKey || !googleApiKey) {
  throw new Error("Missing API key(s)");
}

const openai = new OpenAI({ apiKey: openaiApiKey });
const genAI = new GoogleGenerativeAI(googleApiKey);

export async function POST(req: Request) {
  const { messages, systemMessage: customSystemMessage, temperature: customTemperature, intendedModel } = await req.json() as { 
    messages: ChatCompletionMessageParam[], 
    systemMessage?: ChatCompletionMessageParam, 
    temperature?: number,
    intendedModel?: string
  };

  if (!Array.isArray(messages) || messages.some(msg => typeof msg.content !== 'string')) {
    return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400 });
  }

  const systemMessage = customSystemMessage;
  const updatedMessages = systemMessage ? [systemMessage, ...messages] : messages;
  const temperature = customTemperature ?? 0.7;

  console.log(`Model: ${intendedModel}`);
  console.log(`System prompt: ${systemMessage?.content}`);
  console.log(`User message: ${messages[messages.length - 1].content}`);

  try {
    const stream = intendedModel === 'openai' 
      ? await handleOpenAI(updatedMessages, temperature)
      : await handleGemini(updatedMessages, temperature);

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }), { status: 500 });
  }
}

async function handleOpenAI(messages: ChatCompletionMessageParam[], temperature: number) {
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