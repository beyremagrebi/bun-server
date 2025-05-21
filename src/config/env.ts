export class EnvLoader {
  static readonly uri: string  = String(Bun.env.DATABASE_URL);
  static readonly databaseName: string  = String(Bun.env.DATABASE_NAME);
  static readonly port: number = Number(Bun.env.PORT) || 6000;
}
