export const OMenuOption = {
  Query: 'Query',
  Tools: 'Tools',
  Resources: 'Resources',
  Prompts: 'Prompts',
} as const;

export type MenuOption = (typeof OMenuOption)[keyof typeof OMenuOption];
