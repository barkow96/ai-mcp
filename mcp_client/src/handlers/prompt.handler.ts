import { input } from '@inquirer/prompts';
import { Prompt } from '@modelcontextprotocol/sdk/types.js';
import { handleServerMessagePrompt } from '../handlers';
import { getMcpClient } from '../mcp';

export async function handlePrompt(prompt: Prompt) {
  const args: Record<string, string> = {};

  for (const arg of prompt.arguments ?? []) {
    args[arg.name] = await input({ message: `Enter value for ${arg.name}:` });
  }

  const res = await getMcpClient().getPrompt({
    name: prompt.name,
    arguments: args,
  });

  for (const message of res.messages) {
    console.log(await handleServerMessagePrompt(message));
  }
}
