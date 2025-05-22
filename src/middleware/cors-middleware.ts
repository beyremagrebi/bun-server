import type { MiddlewareFunction } from "../routes/router-manager";

export const corsMiddleware: MiddlewareFunction = async (req: Request) => {
  // If this is a preflight request, return appropriate CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // For regular requests, we'll add CORS headers to the response later
  // Just continue with the request for now
  return req;
};
