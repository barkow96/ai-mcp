import fs from 'node:fs/promises';
import { User, UserData } from '../types';

export async function readUsers(): Promise<User[]> {
  const users = await import('../data/users.json', {
    with: { type: 'json' },
  }).then((m) => m.default);

  return users;
}

export async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(
    './mcp_server/src/data/users.json',
    JSON.stringify(users, null, 2),
  );
}

export async function createUser(userData: UserData): Promise<number> {
  const users = await readUsers();

  const id = users.length + 1;
  users.push({ id, ...userData });
  await saveUsers(users);

  return id;
}
