import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import { OpenAI as OpenAIApi } from "openai";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env file from various possible locations
const envPaths = [
  resolve(__dirname, '../../../.env'),  // server root
  resolve(__dirname, '../../../../.env'), // project root
  resolve(__dirname, '../.env'),  // src folder
  resolve(__dirname, '../../.env')  // server/src folder
];

let envLoaded = false;
for (const path of envPaths) {
  if (fs.existsSync(path)) {
    console.log(`Loading .env from ${path}`);
    dotenv.config({ path });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn("No .env file found in expected locations. Make sure to provide API keys directly.");
}

// Check if API key exists in environment variables
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("OpenAI API key is missing! Check your .env file or set it directly in the code.");
  console.error("Create a .env file in the project root with: OPENAI_API_KEY=your_key_here");
  // Depending on your preference, you might want to throw an error or continue with a dummy key
  // throw new Error("Missing OpenAI API key");
}

// Initialize OpenAI client with appropriate error handling
const client = apiKey 
  ? new OpenAIApi({ apiKey }) 
  : null;

// Health assistant prompt
const healthAssistantPrompt = `You are a highly knowledgeable and empathetic AI health assistant. Your role is to provide users with reliable, evidence-based information about medical conditions, symptoms, treatments, medications, nutrition, mental health, fitness, and general well-being.

Guidelines:
1. Provide only scientifically backed medical insights from reputable sources.
2. Do not diagnose medical conditions; instead, suggest possible causes and encourage consulting a healthcare professional.
3. Do not prescribe medications but explain their uses, side effects, and precautions.
4. Avoid giving emergency medical advice. Always direct users to seek professional help for urgent issues.
5. Use an empathetic and professional tone, ensuring clarity and reassurance.
6. Offer actionable next steps or general guidance based on user queries.
7. Encourage preventive care, healthy lifestyle choices, and mental well-being practices.
8. IMPORTANT: ONLY answer questions related to medical, health, wellness, nutrition, fitness, or mental health topics.
9. For any questions outside the medical/health domain (e.g., politics, entertainment, technology unrelated to healthcare, cooking unrelated to nutrition, etc.), respond with: "I'm designed to assist with health and medical questions only. I don't have the expertise to answer questions outside that domain. Please feel free to ask me any health-related questions instead."
10. Before answering any question, first determine if it falls within the medical/health domain. If it doesn't, use the response in guideline #9.`;

// Default configuration
const aiConfig = {
  client,
  models: {
    default: "gpt-4o",
    fallback: "gpt-3.5-turbo"
  },
  prompts: {
    healthAssistant: healthAssistantPrompt
  },
  defaultParams: {
    temperature: 0.7,
    max_tokens: 500
  }
};

export default aiConfig;