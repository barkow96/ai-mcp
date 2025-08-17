import { input } from '@inquirer/prompts';
import { assureString } from '../mappers';
import { getMcpClient } from '../mcp';

export async function handleResource(uri: string) {
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

  const res = await getMcpClient().readResource({ uri: finalUri });

  const text = assureString(res.contents[0].text);
  console.log(JSON.stringify(JSON.parse(text), null, 2));
}
