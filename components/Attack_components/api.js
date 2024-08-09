import orbits from '../../data/orbits.json';

export async function callOpenai(id, messages, onStreamMessage) {
  const orbit = orbits[id];
  if (!orbit) {
    throw new Error(`No configuration found for ID: ${id}`);
  }

  const { systemMessage, temperature, secret, secretWrapper } = orbit;
  const systemMessageWithSecret = `${systemMessage} ${secretWrapper.replace("(secret)", secret)}`;

  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemMessage: { role: 'system', content: systemMessageWithSecret },
        temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let accumulatedMessage = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });
      accumulatedMessage += chunk;
      onStreamMessage(accumulatedMessage);
    }
  } catch (error) {
    console.error('Error occurred:', error instanceof Error ? error.message : error);
    throw error;
  }
}