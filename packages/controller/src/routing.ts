import {
  type AnyMiddleware,
  type Context,
  type Middleware,
  type Next,
  toMiddleware,
} from "@fastr/core";
import { type Newable, type PropertyKey, reflector } from "@fastr/metadata";
import { type Router, type RouterState } from "@fastr/middleware-router";
import {
  getControllerMetadata,
  getControllerUse,
  getHandlerMetadata,
  getHandlerUse,
  getParameterMetadata,
  type ParameterMetadata,
} from "./impl/metadata.js";
import { type Pipe } from "./pipe.js";

export function addController(
  router: Router,
  ...controllers: Newable[]
): Router {
  for (const controller of controllers) {
    const controllerMetadata = getControllerMetadata(controller);
    if (controllerMetadata == null) {
      throw new Error(`Not a controller class ${controller.name}`);
    }
    const { prototype } = controller;
    const ref = reflector(controller);
    for (const method of Object.values(ref.methods)) {
      const { key } = method;
      const handlerMetadata = getHandlerMetadata(prototype, key);
      if (handlerMetadata == null) {
        continue; // Not a handler method.
      }
      const parameterMetadata = getParameterMetadata(prototype, key);
      router.register({
        name: handlerMetadata.name,
        method: handlerMetadata.method,
        path: joinPaths(controllerMetadata.path, handlerMetadata.path),
        middlewares: [
          ...toMiddlewareList(getControllerUse(controller)),
          ...toMiddlewareList(getHandlerUse(prototype, key)),
          makeMiddleware(controller, key, parameterMetadata),
        ],
      });
    }
  }
  return router;
}

function toMiddlewareList(list: readonly AnyMiddleware[]): Middleware[] {
  return list.map(toMiddleware);
}

function makeMiddleware(
  controller: Newable,
  propertyKey: PropertyKey,
  parameterMetadata: readonly ParameterMetadata[],
): Middleware<RouterState> {
  return async (ctx: Context<RouterState>, next: Next): Promise<void> => {
    const instance = ctx.container.get<any>(controller);
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
