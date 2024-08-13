import { getBoxConfig } from '../../services/firestore';

export async function callOpenai(id, messages, config, onPartialResponse) {
  console.log("Calling OpenAI with initial config:", config);
  
  try {
    // Fetch the latest box configuration from Firestore
    const boxConfig = await getBoxConfig(id);
    if (!boxConfig) {
      throw new Error(`No configuration found for box with ID: ${id}`);
    }

    // Merge the fetched config with the provided config, prioritizing the fetched values
    const mergedConfig = {
      ...config,
      ...boxConfig,
      type: boxConfig.type || config.type || "gpt-4-turbo",
      temperature: boxConfig.temperature || config.temperature || 0.7,
    };

    console.log("Merged configuration:", mergedConfig);

    const intendedModel = mergedConfig.type;
    console.log(`Intended model: ${intendedModel}`);

    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemMessage: { 
          role: 'system', 
          content: mergedConfig.combinedSystemPrompt || "You are a helpful assistant." 
        },
        temperature: mergedConfig.temperature,
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

export async function callGemini(id, messages, config, onPartialResponse) {
  console.log("Calling Gemini with initial config:", config);
  
  try {
    // Fetch the latest box configuration from Firestore
    const boxConfig = await getBoxConfig(id);
    if (!boxConfig) {
      throw new Error(`No configuration found for box with ID: ${id}`);
    }

    // Merge the fetched config with the provided config, prioritizing the fetched values
    const mergedConfig = {
      ...config,
      ...boxConfig,
      type: boxConfig.type || config.type || "gemini-pro",
      temperature: boxConfig.temperature || config.temperature || 0.7,
    };

    console.log("Merged configuration:", mergedConfig);

    const intendedModel = mergedConfig.type;
    console.log(`Intended model: ${intendedModel}`);

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemMessage: { 
          role: 'system', 
          content: mergedConfig.combinedSystemPrompt || "You are a helpful assistant." 
        },
        temperature: mergedConfig.temperature,
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

export async function callAI(id, messages, config, onPartialResponse) {
  const aiType = config.type || 'openai';
  
  if (aiType === 'gemini') {
    return callGemini(id, messages, config, onPartialResponse);
  } else {
    return callOpenai(id, messages, config, onPartialResponse);
  }
}