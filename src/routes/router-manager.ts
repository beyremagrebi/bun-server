export type RouteDefinition = {
  path: string
  method: string
  handlerName: string
  middleware?: Function[]
}
export type MiddlewareFunction = (req: Request) => Promise<Request | Response | boolean | void>
export const routes: Map<any, RouteDefinition[]> = new Map()

export function Route(path: string) {
  return (target: any) => {
    target.prototype.basePath = path
  }
}

function createMethodDecorator(method: string) {
  return (path: string, middleware: Function[] = []) =>
    (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      if (!routes.has(target.constructor)) {
        routes.set(target.constructor, [])
      }
      const routeDefinitions = routes.get(target.constructor)
      routeDefinitions?.push({
        path,
        method,
        handlerName: propertyKey,
        middleware,
      })

      return descriptor
    }
}

// HTTP method decorators
export const Get = createMethodDecorator("GET")
export const Post = createMethodDecorator("POST")
export const Put = createMethodDecorator("PUT")
export const Delete = createMethodDecorator("DELETE")
export const Patch = createMethodDecorator("PATCH")
