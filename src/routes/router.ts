import { routes, type RouteDefinition } from "./router-manager"

export class Router {
  private controllers: any[] = []
  private routeHandlers: Map<string, Map<string, Function>> = new Map()

  constructor() {}

  registerController(Controller: any) {
    const controller = new Controller()
    this.controllers.push(controller)

    const routeDefinitions = routes.get(Controller) || []
    const basePath = controller.basePath || ""

    for (const route of routeDefinitions) {
      this.registerRoute(controller, basePath, route)
    }

    return this
  }

  registerControllers(controllers: any[]) {
    for (const controller of controllers) {
      this.registerController(controller)
    }
    return this
  }

  private registerRoute(controller: any, basePath: string, route: RouteDefinition) {
    const fullPath = `${basePath}${route.path}`
    const handler = controller[route.handlerName].bind(controller)
    const middlewareChain = route.middleware || []

    if (!this.routeHandlers.has(fullPath)) {
      this.routeHandlers.set(fullPath, new Map())
    }

    const methodMap = this.routeHandlers.get(fullPath)!
    methodMap.set(route.method, async (req: Request) => {
      let request = req

      // Apply middleware
      for (const middleware of middlewareChain) {
        const result = await middleware(request)
        if (result === false) {
          return new Response("Forbidden", { status: 403 })
        }
        if (result instanceof Response) {
          return result
        }
        if (result) {
          request = result // Allow middleware to modify request
        }
      }

      return handler(request)
    })
  }

  // Handle incoming requests
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method
    let response: Response
    let handlerFound = false

    // Try to find an exact path match
    const methodHandlers = this.routeHandlers.get(path)
    if (methodHandlers) {
      const handler = methodHandlers.get(method)
      if (handler) {
        handlerFound = true
        response = await handler(req)
        console.log(`${method} ${response.status} ${path}`)
        return response
      }
    }

    // Try to find a pattern match
    for (const [routePath, methodHandlers] of this.routeHandlers.entries()) {
      if (this.pathMatches(routePath, path)) {
        const handler = methodHandlers.get(method)
        if (handler) {
          handlerFound = true
          response = await handler(req)
          console.log(`${method} ${response.status} ${path}`)
          return response
        }
      }
    }

    // No handler found
    if (!handlerFound) {
      response = new Response(`Not Found: ${path}`, { status: 404 })
      console.log(`${method} ${response.status} ${path}`)
      return response
    }

    // This should never be reached, but TypeScript requires a return
    return new Response("Internal Server Error", { status: 500 })
  }

  private pathMatches(pattern: string, path: string): boolean {
    const regexPattern = pattern.replace(/:[^/]+/g, "[^/]+").replace(/\//g, "\\/")

    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(path)
  }
}
