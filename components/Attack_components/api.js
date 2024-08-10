export async function callOpenai(id, messages, config, onPartialResponse) {
  console.log("Calling OpenAI with config:", config);
  const intendedModel = config.type || "gpt-4-turbo";
  console.log(`Intended model: ${intendedModel}. Using OpenAI for now.`);

  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemMessage: { role: 'system', content: config.systemPrompt || "You are a helpful assistant." },
        temperature: config.temperature || 0.7,
        intendedModel: intendedModel,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      accumulatedResponse += chunk;
      if (onPartialResponse) {
        onPartialResponse(accumulatedResponse);
      }
    }

    return accumulatedResponse.trim();
  } catch (error) {
    console.error('Error occurred:', error instanceof Error ? error.message : error);
    throw error;
  }
}