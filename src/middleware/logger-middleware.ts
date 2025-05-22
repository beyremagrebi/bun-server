import type { MiddlewareFunction } from "../routes/router-manager";

export const loggerMiddleware: MiddlewareFunction = async (req: Request) => {
  const url = new URL(req.url);

  console.log(
    `[${new Date().toISOString()}] ${req.method} ${url.pathname} - Request received`,
  );
  return req;
};
