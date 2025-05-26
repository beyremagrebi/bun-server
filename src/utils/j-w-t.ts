import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { ResponseHelper } from "./response-helper";
import { EnvLoader } from "../config/env";
export const generateToken = (
  payload: object,
  expiresIn: StringValue | number = EnvLoader.ExpAccssToken,
): string => {
  if (!EnvLoader.jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, EnvLoader.jwtSecret, {
    expiresIn: expiresIn,
    algorithm: "HS256",
  });
};

export async function verifyToken(
  token: string,
): Promise<string | jwt.JwtPayload> {
  try {
    const decoded = jwt.verify(token, EnvLoader.jwtSecret);
    return decoded;
  } catch (e) {
    return ResponseHelper.unauthorized("Token invalid : " + String(e));
  }
}
