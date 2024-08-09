import { OpenAI } from 'openai';

interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string; // Optional property if needed
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages, systemMessage: customSystemMessage, temperature: customTemperature } = await req.json() as { messages: ChatCompletionMessageParam[], systemMessage?: ChatCompletionMessageParam, temperature?: number };
  console.log(`Received messages from client:
${messages.map((msg: ChatCompletionMessageParam) => `  - ${msg.role}: ${msg.content}`).join('\n')}`);

  // Add a system message
  const defaultSystemMessage: ChatCompletionMessageParam = { role: 'system', content: 'You are a helpful assistant.' };
  const systemMessage = customSystemMessage || defaultSystemMessage;
  const updatedMessages = [systemMessage, ...messages];
  console.log(`System message used:
  - ${systemMessage.role}: ${systemMessage.content}`);
  console.log(`Messages sent to OpenAI including system message:
${updatedMessages.map((msg: ChatCompletionMessageParam) => `  - ${msg.role}: ${msg.content}`).join('\n')}`);

  // Set temperature
  const defaultTemperature = 0.7;
  const temperature = customTemperature ?? defaultTemperature;
  console.log(`Temperature used: ${temperature}`);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: updatedMessages,
      temperature: temperature,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error occurred:', error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }), { status: 500 });
  }
}