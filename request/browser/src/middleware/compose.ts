import type { Adapter, HttpRequest, HttpResponse, Middleware } from "../types";

const id: Middleware = (
  request: HttpRequest,
  adapter: Adapter,
): Promise<HttpResponse> => adapter(request);

export function compose(middleware: readonly Middleware[]): Middleware {
  const result = middleware.reduce(composeTwo, id);
  Object.defineProperty(result, "name", {
    value: `composed[${middleware.map(({ name }) => name).join(",")}]`,
  });
  return result;
}

function composeTwo(a: Middleware, b: Middleware): Middleware {
  return (request: HttpRequest, adapter: Adapter): Promise<HttpResponse> =>
    a(request, (request) => b(request, adapter));
}
