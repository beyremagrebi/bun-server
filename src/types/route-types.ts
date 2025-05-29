import type { Document } from "mongodb";
import type { ServerRequest } from "../config/interfaces/i-request";

export type ExpressMiddleware = (req: ServerRequest) => void;
export type RouteDefinition<T extends Document> = {
  path: string;
  method: string;
  handlerName: keyof T;
  middleware?: ExpressMiddleware[];
};

export type MiddlewareFunction = (
  req: ServerRequest,
) => Promise<ServerRequest | Response | boolean | void>;

export type Constructor<T extends Document> = new (...args: Document[]) => T;

export const routes = new Map<
  Constructor<Document>,
  RouteDefinition<Document>[]
>();
