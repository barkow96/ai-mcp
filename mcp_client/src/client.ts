import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { confirm, input, select } from '@inquirer/prompts';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import {
  Prompt,
  PromptMessage,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { generateText, jsonSchema, ToolSet } from 'ai';
import 'dotenv/config';

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

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

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

        const tool = tools.find((t) => t.name === toolName);

        if (!tool) {
          console.error('Tool not found.');
        } else {
          await handleTool(tool);
        }
        break;

      case 'Resources':
        const resourceUri = await select({
          message: 'Select a resource:',
          choices: [
            ...resources.map((resource) => ({
              name: resource.name,
              value: resource.uri,
              description: resource.description,
            })),
            ...resourceTemplates.map((template) => ({
              name: template.name,
              value: template.uriTemplate,
              description: template.description,
            })),
          ],
        });

        const foundResourceUri = resources.find(
          (r) => r.uri === resourceUri,
        )?.uri;

        const foundResourceTemplateUri = resourceTemplates.find(
          (t) => t.uriTemplate === resourceUri,
        )?.uriTemplate;

        const uri = foundResourceUri ?? foundResourceTemplateUri;

        if (!uri) {
          console.error('Resource not found.');
        } else {
          await handleResource(uri);
        }
        break;

      case 'Prompts':
        const promptName = await select({
          message: 'Select a prompt:',
          choices: prompts.map((prompt) => ({
            name: prompt.name,
            value: prompt.name,
            description: prompt.description,
          })),
        });

        const prompt = prompts.find((p) => p.name === promptName);

        if (!prompt) {
          console.error('Prompt not found.');
        } else {
          await handlePrompt(prompt);
        }
        break;

      case 'Query':
        await handleQuery(tools);
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

async function handleResource(uri: string) {
  let finalUri = uri;
  const paramMatches = uri.match(/{([^}]+)}/g);

  if (paramMatches) {
    for (const paramMatch of paramMatches) {
      const paramName = paramMatch.replace('{', '').replace('}', '');
      const paramValue = await input({
        message: `Enter value for ${paramName}`,
      });

      finalUri = finalUri.replace(paramMatch, paramValue);
    }
  }

  const res = await client.readResource({ uri: finalUri });

  console.log(
    JSON.stringify(JSON.parse(res.contents[0].text as string), null, 2),
  );
}

async function handlePrompt(prompt: Prompt) {
  const args: Record<string, string> = {};

  for (const arg of prompt.arguments ?? []) {
    args[arg.name] = await input({
      message: `Enter value for ${arg.name}:`,
    });
  }

  const res = await client.getPrompt({ name: prompt.name, arguments: args });

  for (const message of res.messages) {
    console.log(await handleServerMessagePrompt(message));
  }
}

async function handleServerMessagePrompt(message: PromptMessage) {
  if (message.content.type !== 'text') return;

  console.log(message.content.text);

  const run = await confirm({
    message: 'Would you like to run the above prompt?',
    default: true,
  });

  if (!run) return;

  const { text } = await generateText({
    model: google('gemini-2.0-flash'),
    prompt: message.content.text,
  });

  return text;
}

async function handleQuery(tools: Tool[]) {
  const query = await input({ message: 'Enter your query:' });

  const { text, toolResults } = await generateText({
    model: google('gemini-2.0-flash'),
    prompt: query,
    tools: tools.reduce(
      (obj, tool) => ({
        ...obj,
        [tool.name]: {
          description: tool.description,
          parameters: jsonSchema(tool.inputSchema),
          execute: async (args: Record<string, any>) => {
            return await client.callTool({
              name: tool.name,
              arguments: args,
            });
          },
        },
      }),
      {} as ToolSet,
    ),
  });

  console.log(
    // @ts-ignore
    text || toolResults[0]?.result?.content[0]?.text || 'No text generated.',
  );
}

main();
