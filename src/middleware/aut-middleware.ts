import { verifyToken } from "../utils/j-w-t";
import { ResponseHelper } from "../utils/response-helper";

export async function authMiddleware(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseHelper.unauthorized("Missing or invalid token");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return ResponseHelper.unauthorized("Missing or invalid token");
    }

    const decoded = await verifyToken(token);
    if (decoded instanceof Response) {
      return decoded;
    }

    return req;
  } catch (err) {
    return ResponseHelper.serverError("Internal server error : " + String(err));
  }
}
