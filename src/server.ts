import { EnvLoader } from "./config/env";
import { ServerStarter } from "./config/server-starter";

const server = new ServerStarter(Number(EnvLoader.port));
server.start();

