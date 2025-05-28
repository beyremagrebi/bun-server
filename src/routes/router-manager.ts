import type { BaseModel } from "../models/base/base-model";
import {
  routes,
  type Constructor,
  type ExpressMiddleware,
  type RouteDefinition,
} from "../types/route-types";

function createMethodDecorator(method: string) {
  return <T extends BaseModel>(
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
