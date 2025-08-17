import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import 'dotenv/config';
import { GOOGLE_MODEL_NAME } from './config';

let google: ReturnType<typeof createGoogleGenerativeAI> | null = null;

export function getGoogle() {
  if (!google) {
    google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return google;
}

export async function generateAiText(prompt: string): Promise<string> {
  const google = getGoogle();

  const { text } = await generateText({
    model: google(GOOGLE_MODEL_NAME),
    prompt,
  });

  return text;
}
