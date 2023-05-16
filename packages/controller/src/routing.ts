import {
  type AnyMiddleware,
  type Application,
  type Context,
  type Middleware,
  type Newable,
  type Next,
} from "@fastr/core";
import { reflector } from "@fastr/metadata";
import { Router, type RouterState } from "@fastr/middleware-router";
import {
  getControllerMetadata,
  getControllerUse,
  getHandlerMetadata,
  getHandlerUse,
  getParameterMetadata,
  type ParameterMetadata,
} from "./impl/metadata.js";
import { type PropertyKey } from "./impl/types.js";
import { type Pipe } from "./pipe.js";

interface Routing {
  add(...controllers: readonly Newable[]): Routing;
  middleware(): Middleware<RouterState>;
}

export function routing(app: Application, router = new Router()): Routing {
  return new (class implements Routing {
    add(...controllers: readonly Newable[]): this {
      for (const controller of controllers) {
        addController(controller);
      }
      return this;
    }

    middleware(): Middleware<RouterState> {
      return router.middleware();
    }
  })();

  function toMiddleware(list: readonly AnyMiddleware[]): Middleware[] {
    return list.map((item) => app.toMiddleware(item as any));
  }

  function addController(controller: Newable): void {
    const controllerMetadata = getControllerMetadata(controller);
    if (controllerMetadata == null) {
      throw new Error("Not a controller class");
    }
    const controllerMiddleware = toMiddleware(getControllerUse(controller));
    const { prototype } = controller;
    const ref = reflector(controller);
    for (const { key } of Object.values(ref.methods)) {
      const handlerMetadata = getHandlerMetadata(prototype, key);
      if (handlerMetadata == null) {
        continue;
      }
      const parameterMetadata = getParameterMetadata(prototype, key);
      const handlerMiddleware = toMiddleware(getHandlerUse(prototype, key));
      const handler = makeHandler(controller, key, parameterMetadata);
      router.register({
        name: handlerMetadata.name,
        method: handlerMetadata.method,
        path: joinPaths(controllerMetadata.path, handlerMetadata.path),
        middlewares: [...controllerMiddleware, ...handlerMiddleware, handler],
      });
    }
  }
}

function makeHandler(
  controller: Newable,
  propertyKey: PropertyKey,
  parameterMetadata: readonly ParameterMetadata[],
): Middleware<RouterState> {
  return async (ctx: Context<RouterState>, next: Next): Promise<void> => {
    const instance = ctx.container.get<any>(controller); // TODO why any?
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
