import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CreateMessageResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { createUser } from '../helpers';

export function registerCreateRandomUserTool(server: McpServer): void {
  server.tool(
    'create-random-user',
    'Create a random user with fake data',
    {
      title: 'Create Random User',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async () => {
      const res = await server.server.request(
        {
          method: 'sampling/createMessage',
          params: {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: 'Generate a fake user data. The user should have a realsitic email, address, and phone number. Return this data as a JSON object with no other text or formatter so it can be used with JSON.parse.',
                },
              },
            ],
            maxTokens: 1024,
          },
        },
        CreateMessageResultSchema,
      );

      if (res.content.type !== 'text') {
        return {
          content: [{ type: 'text', text: 'Failed to generate user data' }],
        };
      }

      try {
        const fakeUser = JSON.parse(
          res.content.text
            .trim()
            .replace(/^```json/, '')
            .replace(/```$/, '')
            .trim(),
        );

        const id = await createUser(fakeUser);

        return {
          content: [{ type: 'text', text: `User ${id} created successfully` }],
        };
      } catch {
        return {
          content: [{ type: 'text', text: 'Failed to generate user data' }],
        };
      }
    },
  );
}
