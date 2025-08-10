import { input } from '@inquirer/prompts';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getMcpClient } from '../mcp';

export async function handleTool(tool: Tool) {
  const args: Record<string, string> = {};

  for (const [key, value] of Object.entries(
    tool.inputSchema.properties ?? {},
  )) {
    args[key] = await input({
      message: `Enter value for ${key} (${(value as { type: string }).type}):`,
    });
  }

  const res = await getMcpClient().callTool({
    name: tool.name,
    arguments: args,
  });
  console.log((res.content as [{ text: string }])[0].text);
}
