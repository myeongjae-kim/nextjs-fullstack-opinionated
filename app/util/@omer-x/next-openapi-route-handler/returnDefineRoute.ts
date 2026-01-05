import _defineRoute from "@omer-x/next-openapi-route-handler";

export type Action<T> = (source: T, request: Request) => Response | Promise<Response>

export type ActionMiddleware<T> = (action: Action<T>) => (source: T, request: Request) => Promise<Response>

export const returnDefineRoute = <T>({ actionMiddleware }: { actionMiddleware?: ActionMiddleware<T> }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defineRoute = ((defineRouteArgs: any) => {
    return _defineRoute({
      ...defineRouteArgs,
      action: actionMiddleware ? actionMiddleware(defineRouteArgs.action) : defineRouteArgs.action
    })
  }) as unknown as typeof _defineRoute;

  return defineRoute;
}