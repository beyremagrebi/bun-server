export function getTokenFromHeaders(headers: Headers): string | null {
  const authHeader =
    headers.get("authorization") || headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1]!;
}
