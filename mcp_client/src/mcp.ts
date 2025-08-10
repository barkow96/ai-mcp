import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

let client: Client | null = null;

export function getMcpClient(): Client | never {
  if (!client) {
    throw new Error('MCP client not initialized. Call initMcpClient() first.');
  }
  return client;
}

export async function initMcpClient(): Promise<Client> {
  if (client) return client;
  const newClient = new Client({
    name: 'mcp-client',
    version: '1.0.0',
    capabilities: { sampling: {} },
  });
  const newTransport = new StdioClientTransport({
    command: 'node',
    args: ['mcp_server/build/server.js'],
    stderr: 'ignore',
  });

  await newClient.connect(newTransport);
  client = newClient;
  return newClient;
}
