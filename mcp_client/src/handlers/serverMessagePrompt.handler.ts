import { confirm } from '@inquirer/prompts';
import { PromptMessage } from '@modelcontextprotocol/sdk/types.js';
import { generateAiText } from '../ai';

export async function handleServerMessagePrompt(message: PromptMessage) {
  if (message.content.type !== 'text') return;

  console.log(message.content.text);

  const run = await confirm({
    message: 'Would you like to run the above prompt?',
    default: true,
  });

  if (!run) return;
  return await generateAiText(message.content.text);
}
