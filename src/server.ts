import { EnvLoader } from "./config/env";
import { ServerStarter } from "./config/server-starter";
import PostController from "./controllers/post-controller";
import UserController from "./controllers/user-controller";

const server = new ServerStarter(
  [UserController, PostController],
  Number(EnvLoader.port),
);
server.start();
