import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set');
      process.exit(1);
    }

    const client = new GoogleGenerativeAI(apiKey);
    const models = await client.listModels();
    
    console.log('\n=== AVAILABLE MODELS ===\n');
    for (const model of models.models) {
      console.log(`Name: ${model.name}`);
      console.log(`Display: ${model.displayName}`);
      console.log(`Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('---');
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

listModels();
