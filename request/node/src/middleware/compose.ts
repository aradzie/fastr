import type { Adapter, Middleware } from "../types";

const id: Middleware = (adapter: Adapter): Adapter => adapter;

export function compose(middleware: readonly Middleware[]): Middleware {
  const result = middleware.reduce(composeTwo, id);
  Object.defineProperty(result, "name", {
    value: `composed[${middleware
      .map(({ name = "anonymous" }) => name)
      .join(",")}]`,
  });
  return result;
}

export function composeTwo(a: Middleware, b: Middleware): Middleware {
  return (adapter: Adapter): Adapter => a(b(adapter));
}
