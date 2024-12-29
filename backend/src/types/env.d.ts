import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  OPENAI_API_KEY: string;
  QDB: D1Database;
}

// Define the expected structure of the OpenAI API response
interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}