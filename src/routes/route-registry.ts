import type { BaseController } from "../controllers/base/base-controller";
import type { RouteDefinition } from "../types/route-types";
import type { BaseModel } from "../models/base/base-model";

export type RouteHandler = (req: Request) => Response | Promise<Response>;

export class RouteRegistry<T extends BaseModel> {
  private routeHandlers: Map<string, Map<string, RouteHandler>> = new Map();

  registerRoute(
    basePath: string,
    route: RouteDefinition<BaseController<T>>,
    handler: RouteHandler,
  ) {
    const fullPath = `${basePath}${route.path}`;

    if (!this.routeHandlers.has(fullPath)) {
      this.routeHandlers.set(fullPath, new Map());
    }

    const methodMap = this.routeHandlers.get(fullPath)!;
    methodMap.set(route.method, handler);
  }

  getRouteHandlers(): Map<string, Map<string, RouteHandler>> {
    return this.routeHandlers;
  }
}
