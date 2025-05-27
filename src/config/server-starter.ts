import Bun from "bun"; // Declare the Bun variable
import type { BaseController } from "../controllers/base/base-controller";

import { Registred } from "../routes/registred";
import { createCorsResponse, handleOptionsRequest } from "../utils/cors";
import { ConnectionDatabase } from "./connection-database";
import { EnvLoader } from "./env";
import { ServerRequest } from "./interfaces/i-request";
import type { IServerStarter } from "./interfaces/i-server-starter";
import { handleUploadsRequest } from "./uploads-response";

export class ServerStarter implements IServerStarter {
  private port = 6000;

  constructor(
    /* eslint-disable @typescript-eslint/no-explicit-any */
    private Controllers: (new () => BaseController<any>)[],
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

    const router = new Registred(this.Controllers);

    Bun.serve({
      port: this.port,
      fetch: async (req) => {
        if (req.method === "OPTIONS") {
          return handleOptionsRequest();
        }
        const url = new URL(req.url);

        if (url.pathname === "/") {
          return new Response("server is running", { status: 200 });
        }
        const uploadsResponse = await handleUploadsRequest(url);
        if (uploadsResponse) return uploadsResponse;
        else {
          const enhancedRequest = new ServerRequest(req);
          const response = await router.router.handleRequest(enhancedRequest);
          if (response.status === 404) {
            return new Response("Not Found", { status: 404 });
          }
          return createCorsResponse(response);
        }
      },
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
