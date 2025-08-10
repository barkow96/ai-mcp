import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerGenerateFakeUserPrompt(server: McpServer): void {
  server.prompt(
    'generate-fake-user',
    'Generate a fake user based on a given name ',
    { name: z.string() },
    ({ name }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Generate a fake user with the name ${name}. The user should have a realsitic email, address, and phone number.`,
            },
          },
        ],
      };
    },
  );
}
