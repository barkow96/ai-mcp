import { input } from '@inquirer/prompts';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { generateText, jsonSchema, ToolSet } from 'ai';
import { getGoogle } from '../ai';
import { getMcpClient } from '../mcp';

export async function handleQuery(tools: Tool[]) {
  const query = await input({ message: 'Enter your query:' });
  const google = getGoogle();

  const { text, toolResults } = await generateText({
    model: google('gemini-2.0-flash'),
    prompt: query,
    tools: tools.reduce(
      (obj, tool) => ({
        ...obj,
        [tool.name]: {
          description: tool.description,
          parameters: jsonSchema(tool.inputSchema),
          execute: async (args: Record<string, any>) => {
            return await getMcpClient().callTool({
              name: tool.name,
              arguments: args,
            });
          },
        },
      }),
      {} as ToolSet,
    ),
  });
  console.log(
    // @ts-ignore
    text || toolResults[0]?.result?.content[0]?.text || 'No text generated.',
  );
}
