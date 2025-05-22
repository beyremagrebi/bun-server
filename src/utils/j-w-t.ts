import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { ResponseHelper } from "./response-helper";
export const generateToken = (
  payload: object,
  expiresIn: StringValue | number = "5m",
): string => {
  if (!Bun.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, Bun.env.JWT_SECRET, {
    expiresIn: expiresIn,
    algorithm: "HS256",
  });
};

export async function verifyToken(
  token: string,
): Promise<string | jwt.JwtPayload> {
  try {
    const decoded = jwt.verify(token, Bun.env.JWT_SECRET!);
    return decoded;
  } catch (e) {
    return ResponseHelper.unauthorized("Token invalid : " + String(e));
  }
}
