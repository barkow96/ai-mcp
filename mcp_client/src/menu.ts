import { select } from '@inquirer/prompts';
import {
  handlePrompt,
  handleQuery,
  handleResource,
  handleTool,
} from './handlers';
import { getMcpClient } from './mcp';
import { MenuOption, OMenuOption } from './types';

export async function runMenu() {
  const client = getMcpClient();

  const [{ tools }, { prompts }, { resources }, { resourceTemplates }] =
    await Promise.all([
      client.listTools(),
      client.listPrompts(),
      client.listResources(),
      client.listResourceTemplates(),
    ]);

  while (true) {
    const option = await select<MenuOption>({
      message: 'What would you like to do?',
      choices: Object.values(OMenuOption),
    });

    switch (option) {
      case OMenuOption.Tools:
        const toolName = await select({
          message: 'Select a tool:',
          choices: tools.map((tool) => ({
            name: tool.annotations?.title || tool.name,
            value: tool.name,
            description: tool.description,
          })),
        });

        const tool = tools.find((t) => t.name === toolName);

        if (!tool) console.error('Tool not found.');
        else await handleTool(tool);
        break;

      case OMenuOption.Resources:
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

        if (!uri) console.error('Resource not found.');
        else await handleResource(uri);
        break;

      case OMenuOption.Prompts:
        const promptName = await select({
          message: 'Select a prompt:',
          choices: prompts.map((prompt) => ({
            name: prompt.name,
            value: prompt.name,
            description: prompt.description,
          })),
        });

        const prompt = prompts.find((p) => p.name === promptName);

        if (!prompt) console.error('Prompt not found.');
        else await handlePrompt(prompt);
        break;

      case OMenuOption.Query:
        await handleQuery(tools);
        break;
    }
  }
}
