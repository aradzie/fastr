import {
  type Context,
  type Middleware,
  type Next,
  toMiddleware,
} from "@fastr/core";
import {
  isConstructor,
  type Newable,
  type PropertyKey,
  reflectorOf,
} from "@fastr/lang";
import { type RouteOptions, type RouterState } from "@fastr/middleware-router";
import {
  getControllerMetadata,
  getControllerUse,
  getHandlerMetadata,
  getHandlerUse,
  getParameterMetadata,
  type ParameterMetadata,
} from "./impl/metadata.js";
import { type Pipe } from "./pipe.js";

export function* allToRoutes(
  ...newables: readonly Newable[]
): Iterable<RouteOptions> {
  for (const newable of newables) {
    for (const route of toRoutes(newable)) {
      yield route;
    }
  }
}

export function* toRoutes(newable: Newable): Iterable<RouteOptions> {
  if (!isConstructor(newable)) {
    throw new TypeError();
  }
  const controllerMetadata = getControllerMetadata(newable);
  if (controllerMetadata == null) {
    throw new Error(`Not a controller class ${newable.name}`);
  }
  const { prototype } = newable;
  const ref = reflectorOf(newable);
  for (const method of Object.values(ref.methods)) {
    const { key } = method;
    const handlerMetadata = getHandlerMetadata(prototype, key);
    if (handlerMetadata != null) {
      const controllerUse = getControllerUse(newable);
      const handlerUse = getHandlerUse(prototype, key);
      const parameterMetadata = getParameterMetadata(prototype, key);
      yield {
        name: handlerMetadata.name,
        method: handlerMetadata.method,
        path: joinPaths(controllerMetadata.path, handlerMetadata.path),
        middleware: [
          ...controllerUse.map(toMiddleware),
          ...handlerUse.map(toMiddleware),
          toHandlerMiddleware(newable, key, parameterMetadata),
        ],
      };
    }
  }
}

function toHandlerMiddleware(
  newable: Newable,
  propertyKey: PropertyKey,
  parameterMetadata: readonly ParameterMetadata[],
): Middleware<RouterState> {
  return async (ctx: Context<RouterState>, next: Next): Promise<void> => {
    const instance = ctx.container.get<any>(newable);
    const handler = instance[propertyKey];
    const args = await getArgs(ctx, parameterMetadata);
    const body = await Reflect.apply(handler, instance, args);
    if (body != null) {
      ctx.response.body = body;
    }
    await next();
  };
}

async function getArgs(
  ctx: Context<RouterState>,
  parameterMetadata: readonly ParameterMetadata[],
): Promise<unknown[]> {
  const args: unknown[] = [];
  for (const { parameterIndex, extractor, key, pipe } of parameterMetadata) {
    let value = extractor(ctx, key);
    if (value != null && pipe != null) {
      value = await ctx.container.get<Pipe>(pipe).transform(ctx, value);
    }
    args[parameterIndex] = value ?? null;
  }
  return args;
}

function joinPaths(prefix: string, suffix: string): string {
  if (prefix === "" || prefix === "/") {
    return suffix;
  }
  if (suffix === "" || suffix === "/") {
    return prefix;
  }
  return prefix + suffix;
}
