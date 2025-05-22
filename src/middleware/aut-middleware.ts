import { ResponseHelper } from "../utils/response-helper";

export function authMiddleware(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ResponseHelper.unauthorized("Missing or invalid token");
  }
  return req;
}
