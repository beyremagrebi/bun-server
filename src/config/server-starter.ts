import Bun from "bun"; // Declare the Bun variable
import type { Document } from "mongodb";
import type { BaseController } from "../controllers/base-controller";
import type { IServerStarter } from "../interfaces/i-server-starter";
import { Router } from "../routes/router";
import { ConnectionDatabase } from "./connection-database";
import { EnvLoader } from "./env";

export class ServerStarter<T extends Document> implements IServerStarter {
  private port = 6000;
  private router: Router<T> | null = null;

  constructor(
    private Controller: new () => BaseController<T>,
    port?: number,
  ) {
    if (port) this.port = port;
  }

  async connection(): Promise<void> {
    try {
      await ConnectionDatabase.connect(EnvLoader.uri);
      console.log("Database connected");
    } catch (error) {
      console.error("DB connection failed", error);
      throw error;
    }
  }

  async listen(port: number): Promise<void> {
    this.port = port;

    this.router = new Router<T>();

    this.router.registerControllers([this.Controller]);

    Bun.serve({
      port: this.port,
      fetch: (req) => this.router!.handleRequest(req),
    });

    console.log(`Server running at port: ${this.port}`);
  }

  async start(): Promise<void> {
    try {
      await this.connection();
      await this.listen(this.port);
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }
}
