import type { Document } from "mongodb";

export type ExpressMiddleware = (req: Request) => void;
export type RouteDefinition<T extends Document> = {
  path: string;
  method: string;
  handlerName: keyof T;
  middleware?: ExpressMiddleware[];
};

export type MiddlewareFunction = (
  req: Request,
) => Promise<Request | Response | boolean | void>;

export type Constructor<T extends Document> = new (...args: Document[]) => T;

export const routes = new Map<
  Constructor<Document>,
  RouteDefinition<Document>[]
>();
