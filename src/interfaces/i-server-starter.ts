export interface IServerStarter {
  listen: (port: number) => Promise<void>;
  start: () => Promise<void>;
  connection: () => Promise<void>;
}
