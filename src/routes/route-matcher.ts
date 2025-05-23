export class RouteMatcher {
  static pathMatches(pattern: string, path: string): boolean {
    const regexPattern = pattern
      .replace(/:[^/]+/g, "[^/]+")
      .replace(/\//g, "\\/");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  static extractParams(
    routePath: string,
    actualPath: string,
  ): Record<string, string> {
    const routeParts = routePath.split("/");
    const pathParts = actualPath.split("/");
    const params: Record<string, string> = {};

    routeParts.forEach((part, i) => {
      if (part.startsWith(":")) {
        const key = part.slice(1);
        params[key] = decodeURIComponent(pathParts[i] || "");
      }
    });

    return params;
  }
}
