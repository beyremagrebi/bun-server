import type { Document } from "mongodb";
import type { BaseController } from "../controllers/base/base-controller";
import { routes, type RouteDefinition } from "../types/route-types";
import { RouteMatcher } from "./route-matcher";
import { MiddlewareExecutor } from "../middleware/middleware-extractor";
import { ResponseHelper } from "../utils/response-helper";

import { RouteRegistry, type RouteHandler } from "./route-registry";
import type { ServerRequest } from "../config/interfaces/i-request";
import { Logger } from "../config/logger";

export class Router<T extends Document> {
  private controllers: BaseController<T>[] = [];
  private routeRegistry = new RouteRegistry<T>();

  registerController(Controller: new () => BaseController<T>) {
    const controller = new Controller();
    this.controllers.push(controller);

    const routeDefinitions = routes.get(Controller) || [];
    const basePath = controller.basePath || "";

    for (const route of routeDefinitions) {
      this.registerRoute(controller, basePath, route);
    }

    return this;
  }

  registerControllers(controllers: Array<new () => BaseController<T>>) {
    for (const Controller of controllers) {
      this.registerController(Controller);
    }
    return this;
  }

  private registerRoute(
    controller: BaseController<T>,
    basePath: string,
    route: RouteDefinition<BaseController<T>>,
  ) {
    const handlerFunction = controller[route.handlerName];

    if (typeof handlerFunction !== "function") {
      throw new Error(`Handler ${String(route.handlerName)} is not a function`);
    }

    const handler = handlerFunction.bind(controller) as RouteHandler;
    const middlewareChain = route.middleware || [];

    const wrappedHandler = async (req: Request) => {
      const middlewareResult = await MiddlewareExecutor.executeMiddlewareChain(
        middlewareChain,
        req,
      );

      if (MiddlewareExecutor.isResponse(middlewareResult)) {
        return middlewareResult;
      }

      try {
        return await handler(middlewareResult);
      } catch (error) {
        console.error("Handler error:", error);
        return ResponseHelper.error("Internal Server Error");
      }
    };

    this.routeRegistry.registerRoute(basePath, route, wrappedHandler);
  }

  async handleRequest(req: ServerRequest): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    const routeHandlers = this.routeRegistry.getRouteHandlers();

    // Check for exact path match
    const methodHandlers = routeHandlers.get(path);
    if (methodHandlers) {
      const handler = methodHandlers.get(method);
      if (handler) {
        const response = await handler(req);
        Logger.logHttp(method, response.status, path);
        return response;
      }
    }

    // Check for parameterized path match
    for (const [routePath, methodHandlers] of routeHandlers.entries()) {
      if (RouteMatcher.pathMatches(routePath, path)) {
        const handler = methodHandlers.get(method);
        if (handler) {
          const params = RouteMatcher.extractParams(routePath, path);
          req.params = params;
          const response = await handler(req);
          Logger.logHttp(method, response.status, path);
          return response;
        }
      }
    }
    // No handler found
    const response = new Response(`Not Found: ${path}`, { status: 404 });
    Logger.logHttp(method, response.status, path);
    return response;
  }
}
