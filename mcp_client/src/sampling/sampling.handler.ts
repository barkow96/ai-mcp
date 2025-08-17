import { CreateMessageRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { GOOGLE_MODEL_NAME } from '../config';
import { handleServerMessagePrompt } from '../handlers';
import { getMcpClient } from '../mcp';

export function registerSamplingHandler() {
  try {
    const client = getMcpClient();

    client.setRequestHandler(CreateMessageRequestSchema, async (request) => {
      const texts: string[] = [];

      for (const message of request.params.messages) {
        const text = await handleServerMessagePrompt(message);
        if (text) texts.push(text);
      }

      return {
        role: 'user',
        model: GOOGLE_MODEL_NAME,
        stopReason: 'endTurn',
        content: { type: 'text', text: texts.join('\n') },
      };
    });
  } catch {
    console.error('Error setting request handler.');
  }
}
