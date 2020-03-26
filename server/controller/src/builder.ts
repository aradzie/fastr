import {
  Router,
  RouterContext,
  RouterMiddleware,
} from "@webfx-middleware/router";
import {
  IMiddleware,
  isMiddlewareClass,
  MiddlewareId,
} from "@webfx/middleware";
import { Container } from "inversify";
import Koa from "koa";
import {
  getControllerMetadata,
  getControllerUse,
  getHandlerMetadata,
  getHandlerUse,
  getParameterMetadata,
  ParameterMetadata,
} from "./metadata";
import { IPipe } from "./pipe";
import { kApp, kContext, kRequest, kResponse, kRouter } from "./types";

const kContainer = Symbol("kContainer");

declare module "koa" {
  interface ExtendableContext {
    [kContainer]: Container;
  }
}

type Constructor = { new (...args: any[]): object };

export interface Options {
  readonly autoBind: boolean;
}

export class Builder {
  private readonly options: Options;

  constructor(private container: Container, options: Partial<Options> = {}) {
    this.options = {
      autoBind: true,
      ...options,
    };
  }

  use(app: Koa, ...ids: MiddlewareId[]) {
    for (const middleware of this.resolveMiddleware(ids)) {
      app.use(middleware);
    }
    return this;
  }

  add(router: Router, ...controllers: Constructor[]) {
    for (const controller of controllers) {
      if (this.options.autoBind && !this.container.isBound(controller)) {
        this.container.bind(controller).toSelf();
      }
      this.registerController(router, controller);
    }
    return this;
  }

  build() {}

  private registerController(router: Router, controller: Constructor) {
    const controllerMetadata = getControllerMetadata(controller);
    if (controllerMetadata == null) {
      throw new Error("Not a controller class");
    }
    const controllerMiddleware = this.resolveMiddleware(
      getControllerUse(controller),
    );
    const descriptors = Object.getOwnPropertyDescriptors(controller.prototype);
    for (const [propertyKey, descriptor] of Object.entries(descriptors)) {
      if (propertyKey == "constructor") {
        continue;
      }
      if (typeof descriptor.value != "function") {
        continue;
      }
      const handlerMetadata = getHandlerMetadata(
        controller.prototype,
        propertyKey,
      );
      if (handlerMetadata == null) {
        continue;
      }
      const parameterMetadata = getParameterMetadata(
        controller.prototype,
        propertyKey,
      );
      const handlerMiddleware = this.resolveMiddleware(
        getHandlerUse(controller.prototype, propertyKey),
      );
      const handler = this.handlerFactory(
        controller,
        propertyKey,
        parameterMetadata,
      );
      const path = joinPaths(controllerMetadata.path, handlerMetadata.path);
      const middlewares = [
        ...controllerMiddleware,
        ...handlerMiddleware,
        handler,
      ];
      router.register({
        name: handlerMetadata.name,
        method: handlerMetadata.method,
        path,
        middlewares,
      });
    }
  }

  private getContainer(ctx: RouterContext) {
    const { app, request, response, router } = ctx;
    let container = ctx[kContainer];
    if (container == null) {
      ctx[kContainer] = container = this.container.createChild();
      container.bind(Container).toConstantValue(container);
      container.bind(kApp).toConstantValue(app);
      container.bind(kContext).toConstantValue(ctx);
      container.bind(kRequest).toConstantValue(request);
      container.bind(kResponse).toConstantValue(response);
    }
    if (!container.isBound(kRouter)) {
      container.bind(kRouter).toConstantValue(router);
    }
    return container;
  }

  private resolveMiddleware(
    ids: readonly MiddlewareId[],
  ): readonly RouterMiddleware[] {
    return ids.map((id) => {
      if (isMiddlewareClass(id)) {
        if (this.options.autoBind && !this.container.isBound(id)) {
          this.container.bind(id).toSelf();
        }
        return (ctx: RouterContext, next: Koa.Next) => {
          const container = this.getContainer(ctx);
          const instance = container.get<IMiddleware>(id);
          return instance.handle(ctx, next);
        };
      } else {
        return id as RouterMiddleware;
      }
    });
  }

  private handlerFactory(
    controller: Constructor,
    propertyKey: string | symbol,
    parameterMetadata: readonly ParameterMetadata[],
  ): RouterMiddleware {
    return async (ctx: RouterContext, next: Koa.Next) => {
      const container = this.getContainer(ctx);
      const instance = container.get<any>(controller);
      const handler = instance[propertyKey] as Function;
      const parameters = await this.extractParameters(
        container,
        ctx,
        parameterMetadata,
      );
      const result = await Reflect.apply(handler, instance, parameters);
      if (result != null) {
        ctx.response.body = result;
      }
    };
  }

  private async extractParameters(
    container: Container,
    ctx: RouterContext,
    params: readonly ParameterMetadata[],
  ): Promise<readonly any[]> {
    const args = [];
    for (const { parameterIndex, extractor, key, pipe } of params) {
      let value = extractor(ctx, key);
      if (value != null && pipe != null) {
        const instance = container.get<IPipe>(pipe);
        value = await instance.transform(ctx, value);
      }
      args[parameterIndex] = value ?? null;
    }
    return args;
  }
}

function joinPaths(prefix: string, suffix: string) {
  if (prefix == "" || prefix == "/") {
    return suffix;
  }
  if (suffix == "" || suffix == "/") {
    return prefix;
  }
  return prefix + suffix;
}
