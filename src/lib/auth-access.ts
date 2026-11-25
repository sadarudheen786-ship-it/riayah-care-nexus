const PUBLIC_AUTH_PATHS = new Set(["/login", "/reset-password"]);

export function requiresPageAuthentication(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return false;
  return !PUBLIC_AUTH_PATHS.has(pathname);
}

export function hasAdminRole(roles: readonly string[]): boolean {
  return roles.includes("admin");
}