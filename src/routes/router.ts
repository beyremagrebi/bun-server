import type { Document } from "mongodb";
import type { BaseController } from "../controllers/base/base-controller";
import { routes, type RouteDefinition } from "../types/route-types";
import { ResponseHelper } from "../utils/response-helper";

type RouteHandler = (req: Request) => Response | Promise<Response>;
export interface CustomRequest extends Request {
  params?: Record<string, string>;
}

export class Router<T extends Document> {
  private controllers: BaseController<T>[] = [];

  private routeHandlers: Map<string, Map<string, RouteHandler>> = new Map();

  constructor() {}

  private extractParams(
    routePath: string,
    actualPath: string,
  ): Record<string, string> {
    const routeParts = routePath.split("/");
    const pathParts = actualPath.split("/");
    const params: Record<string, string> = {};

    routeParts.forEach((part, i) => {
      if (part.startsWith(":")) {
        const key = part.slice(1);
        params[key] = decodeURIComponent(pathParts[i] || "");
      }
    });

    return params;
  }

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
    const fullPath = `${basePath}${route.path}`;
    const handlerFunction = controller[route.handlerName];

    if (typeof handlerFunction !== "function") {
      throw new Error(`Handler ${String(route.handlerName)} is not a function`);
    }

    const handler = handlerFunction.bind(controller) as (
      req: Request,
    ) => Promise<Response> | Response;

    const middlewareChain = route.middleware || [];

    if (!this.routeHandlers.has(fullPath)) {
      this.routeHandlers.set(fullPath, new Map());
    }

    const methodMap = this.routeHandlers.get(fullPath)!;
    methodMap.set(route.method, async (req: Request) => {
      let request = req;
      for (const middleware of middlewareChain) {
        const result = await middleware(request);

        if (this.isResponse(result)) {
          return result;
        }

        if (this.isRequest(result)) {
          request = result;
        }
      }

      try {
        return await handler(request);
      } catch (error) {
        console.error("Handler error:", error);
        return ResponseHelper.error("Internal Server Error");
      }
    });
  }

  isResponse(value: unknown): value is Response {
    return value instanceof Response;
  }
  isRequest(value: unknown): value is Request {
    return value instanceof Request;
  }
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    let response: Response;
    let handlerFound = false;

    const methodHandlers = this.routeHandlers.get(path);
    if (methodHandlers) {
      const handler = methodHandlers.get(method);
      if (handler) {
        handlerFound = true;
        response = await handler(req);
        console.log(`${method} ${response.status} ${path}`);
        return response;
      }
    }

    for (const [routePath, methodHandlers] of this.routeHandlers.entries()) {
      if (this.pathMatches(routePath, path)) {
        const handler = methodHandlers.get(method);
        if (handler) {
          const params = this.extractParams(routePath, path);
          const updatedReq = new Request(req.url, {
            method: req.method,
            headers: req.headers,
            body: req.body,
          });

          // Add `params` to the request object via symbol or monkey-patching
          (updatedReq as CustomRequest).params = params;

          handlerFound = true;
          response = await handler(updatedReq);
          console.log(`${method} ${response.status} ${path}`);
          return response;
        }
      }
    }

    if (!handlerFound) {
      response = new Response(`Not Found: ${path}`, { status: 404 });
      console.log(`${method} ${response.status} ${path}`);
      return response;
    }
    return new Response("Internal Server Error", { status: 500 });
  }

  private pathMatches(pattern: string, path: string): boolean {
    const regexPattern = pattern
      .replace(/:[^/]+/g, "[^/]+")
      .replace(/\//g, "\\/");

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }
}
