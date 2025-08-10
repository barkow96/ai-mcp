import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { readUsers } from '../helpers';

export function registerUserDetailsResource(server: McpServer): void {
  server.resource(
    'user-details',
    new ResourceTemplate('users://{userId}/profile', { list: undefined }),
    {
      description: "Get a user's details from the database",
      title: 'User Details',
      mimeType: 'application/json',
    },
    async (uri, { userId }) => {
      const users = await readUsers();

      const searchedId = Array.isArray(userId) ? userId[0] : userId;
      const searchedUser = users.find((u) => u.id === parseInt(searchedId));

      if (!searchedUser) {
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify({ error: 'User not found' }),
              mimeType: 'application/json',
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(searchedUser),
            mimeType: 'application/json',
          },
        ],
      };
    },
  );
}
