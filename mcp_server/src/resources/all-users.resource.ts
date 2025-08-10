import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readUsers } from '../helpers';

export function registerAllUsersResource(server: McpServer): void {
  server.resource(
    'users',
    'users://all',
    {
      description: 'Get all users data from the database',
      title: 'Users',
      mimeType: 'application/json',
    },
    async (uri) => {
      const users = await readUsers();
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(users),
            mimeType: 'application/json',
          },
        ],
      };
    },
  );
}
