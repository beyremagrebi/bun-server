import type { JwtPayload } from "jwt-decode";

export class MyJwtPayload implements JwtPayload {
  _id?: string;
  iat?: number;
  exp?: number;
  aud?: string | string[] | undefined;
  iss?: string | undefined;
  jti?: string | undefined;
  nbf?: number | undefined;
  sub?: string | undefined;
  // add other fields if present in your token
}
