import { EnvLoader } from "./config/env";
import { ServerStarter } from "./config/server-starter";
import { ControllerManager } from "./controllers/base/controller-manager";

const server = new ServerStarter(
  ControllerManager.getAllControllers(),
  Number(EnvLoader.port),
);
server.start();