import type { Document } from "mongodb";

export type RouteDefinition<T extends Document> = {
  path: string;
  method: string;
  handlerName: keyof T;
  middleware?: ExpressMiddleware[];
};

type ExpressMiddleware = (req: Request) => void;
export type MiddlewareFunction = (
  req: Request,
) => Promise<Request | Response | boolean | void>;

type Constructor<T extends Document> = new (...args: Document[]) => T;

export const routes = new Map<
  Constructor<Document>,
  RouteDefinition<Document>[]
>();

function createMethodDecorator(method: string) {
  return <T extends Document>(
      path: string,
      middleware: ExpressMiddleware[] = [],
    ) =>
    (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
      const constructor = target.constructor as Constructor<T>;

      if (!routes.has(constructor)) {
        routes.set(constructor, []);
      }
      const routeDefinitions = routes.get(constructor) as RouteDefinition<T>[];

      routeDefinitions.push({
        path,
        method,
        handlerName: propertyKey as keyof T,
        middleware,
      });

      return descriptor;
    };
}

export const Get = createMethodDecorator("GET");
export const Post = createMethodDecorator("POST");
export const Put = createMethodDecorator("PUT");
export const Delete = createMethodDecorator("DELETE");
export const Patch = createMethodDecorator("PATCH");
