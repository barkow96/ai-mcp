import 'dotenv/config';
import { initMcpClient } from './mcp';
import { runMenu } from './menu';
import { registerSamplingHandler } from './sampling';

async function main() {
  await initMcpClient();

  registerSamplingHandler();
  console.log('You are connected!');

  await runMenu();
}

main();
