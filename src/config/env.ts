import type { StringValue } from "ms";
export class EnvLoader {
  static readonly uri: string = String(Bun.env.DATABASE_URL);
  static readonly databaseName: string = String(Bun.env.DATABASE_NAME);
  static readonly port: number = Number(Bun.env.PORT) || 6000;
  static readonly jwtSecret: string = String(Bun.env.JWT_SECRET);
  static readonly sendGridKey: string = String(Bun.env.SENDGRID_API_KEY);
  static readonly emailSender: string = String(Bun.env.EMAIL_ADRESS);
  static readonly ExpAccssToken: StringValue | number =
    (Bun.env.EXP_ACCESS_TOKEN as StringValue) || "15m";
  static readonly ExpRefreshToken: StringValue | number =
    (Bun.env.EXP_REFRESH_TOKEN as StringValue) || "7d";
}
