export type Role = "ADMIN" | "CLIENT" | "EMPLOYEE";

export type AuthUser = {
  username: string;
  role: Role;
  token: string;
};
