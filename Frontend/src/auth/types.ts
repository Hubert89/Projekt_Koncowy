export type Role = "ADMIN" | "CLIENT" | "EMPLOYEE";

export type UserSession = {
  id?: number;
  username: string;
  role: Role;
};
