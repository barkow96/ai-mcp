import { input, select } from '@inquirer/prompts';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

const client = new Client({
  name: 'mcp-client',
  version: '1.0.0',
  capabilities: {
    sampling: {},
  },
});

const transport = new StdioClientTransport({
  command: 'node',
  args: ['mcp_server/build/server.js'],
  stderr: 'ignore',
});

async function main() {
  await client.connect(transport);

  const [{ tools }, { prompts }, { resources }, { resourceTemplates }] =
    await Promise.all([
      client.listTools(),
      client.listPrompts(),
      client.listResources(),
      client.listResourceTemplates(),
    ]);

  console.log('You are connected!');

  // Main menu
  while (true) {
    const option = await select({
      message: 'What would you like to do?',
      choices: ['Query', 'Tools', 'Resources', 'Prompts'],
    });

    switch (option) {
      case 'Tools':
        const toolName = await select({
          message: 'Select a tool to use:',
          choices: tools.map((tool) => ({
            name: tool.annotations?.title || tool.name,
            value: tool.name,
            description: tool.description,
          })),
        });
        console.log(toolName);

        const tool = tools.find((t) => t.name === toolName);

        if (!tool) {
          console.error('Tool not found.');
        } else {
          await handleTool(tool);
        }
        break;
    }
  }
}

async function handleTool(tool: Tool) {
  const args: Record<string, string> = {};

  for (const [key, value] of Object.entries(
    tool.inputSchema.properties ?? {},
  )) {
    args[key] = await input({
      message: `Enter value for ${key} (${(value as { type: string }).type}):`,
    });
  }

  const res = await client.callTool({ name: tool.name, arguments: args });

  console.log((res.content as [{ text: string }])[0].text);
}

main();
