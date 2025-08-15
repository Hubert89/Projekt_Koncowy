export type Role = "ADMIN" | "CLIENT" | "EMPLOYEE";

export type User = {
  id?: number;
  username: string;
  role: Role;
};
