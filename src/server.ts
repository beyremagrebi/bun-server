import { EnvLoader } from "./config/env";
import { ServerStarter } from "./config/server-starter";
import UserController from "./controllers/user-controller";

const server = new ServerStarter(UserController, Number(EnvLoader.port));
server.start();
