import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createUser } from '../helpers';

export function registerCreateUserTool(server: McpServer): void {
  server.tool(
    'create-user',
    'Create a new user in the database',
    {
      name: z.string(),
      email: z.string(),
      address: z.string(),
      phone: z.string(),
    },
    {
      title: 'Create User',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async (params) => {
      try {
        const id = await createUser(params);
        return {
          content: [{ type: 'text', text: `User ${id} created successfully` }],
        };
      } catch {
        return { content: [{ type: 'text', text: 'Failed to save user' }] };
      }
    },
  );
}
