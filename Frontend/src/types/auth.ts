export type Role = 'CLIENT' | 'EMPLOYEE' | 'ADMIN';

export type UserSession = {
  username: string;
  role: Role;
  token: string;
};
