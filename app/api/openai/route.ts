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
  console.log('Received POST request to /api/openai');
  const { messages, systemMessage: customSystemMessage, temperature: customTemperature, intendedModel } = await req.json() as { 
    messages: ChatCompletionMessageParam[], 
    systemMessage?: ChatCompletionMessageParam, 
    temperature?: number,
    intendedModel?: string
  };

  console.log(`Intended model: ${intendedModel}. Using OpenAI's gpt-4-turbo for now.`);
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
  console.log('Updated messages with system message:', JSON.stringify(updatedMessages, null, 2));

  // Set temperature
  const defaultTemperature = 0.7;
  const temperature = customTemperature ?? defaultTemperature;
  console.log(`Using temperature: ${temperature}`);

  try {
    console.log('Sending request to OpenAI API');
    console.log('Request parameters:', JSON.stringify({
      model: 'gpt-4-turbo',
      messages: updatedMessages,
      temperature: temperature,
      stream: true,
    }, null, 2));

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: updatedMessages,
      temperature: temperature,
      stream: true,
    });

    console.log('Received streaming response from OpenAI API');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          console.log('Received chunk:', text);
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
        console.log('Stream closed');
      }
    });

    console.log('Returning streaming response');
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error occurred:', error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }), { status: 500 });
  }
}