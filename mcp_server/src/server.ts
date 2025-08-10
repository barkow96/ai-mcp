import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGenerateFakeUserPrompt } from './prompts';
import {
  registerAllUsersResource,
  registerUserDetailsResource,
} from './resources';
import { registerCreateRandomUserTool, registerCreateUserTool } from './tools';

const server = new McpServer({
  name: 'mcp-server',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
});

registerCreateUserTool(server);
registerAllUsersResource(server);
registerUserDetailsResource(server);
registerGenerateFakeUserPrompt(server);
registerCreateRandomUserTool(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
