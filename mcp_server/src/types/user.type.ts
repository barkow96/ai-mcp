export type UserData = {
  name: string;
  email: string;
  address: string;
  phone: string;
};

export type User = UserData & { id: number };
