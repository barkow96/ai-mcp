import { select } from '@inquirer/prompts';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

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
  }
}

main();
