export function parseJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function normalizeRole(input: unknown): 'ADMIN' | 'EMPLOYEE' | 'CLIENT' {
  if (!input) return 'CLIENT';
  const raw = String(input).toUpperCase().replace(/^ROLE_/, '');
  if (raw.includes('ADMINISTRATOR') || raw.includes('ADMIN')) return 'ADMIN';
  if (raw.includes('PRACOWNIK') || raw.includes('EMPLOYEE') || raw.includes('WORKER') || raw.includes('STAFF')) return 'EMPLOYEE';
  return 'CLIENT';
}
