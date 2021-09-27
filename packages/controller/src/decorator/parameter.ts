import {
  getBody,
  getContext,
  getCookieParam,
  getHeaderParam,
  getPathParam,
  getQueryParam,
  getRequest,
  getResponse,
} from "../context.js";
import { ParameterExtractor, setParameterMetadata } from "../metadata.js";
import type { IPipe } from "../pipe.js";
import type { Type } from "../types.js";

/**
 * An annotation factory for decorators which decorate arguments of type `Koa.Context`.
 *
 * ```typescript
 * @controller()
 * class MyController {
 *     @handler()
 *     myHandler(@context() ctx: Koa.Context) { ... }
 * }
 * ```
 */
export function context(): ParameterDecorator {
  return makeParamDecorator(getContext);
}

/**
 * An annotation factory for decorators which decorate arguments of type `Koa.Request`.
 *
 * ```typescript
 * @controller()
 * class MyController {
 *     @handler()
 *     myHandler(@request() req: Koa.Request) { ... }
 * }
 * ```
 */
export function request(): ParameterDecorator {
  return makeParamDecorator(getRequest);
}

/**
 * An annotation factory for decorators which decorate arguments of type `Koa.Response`.
 *
 * ```typescript
 * @controller()
 * class MyController {
 *     @handler()
 *     myHandler(@response() res: Koa.Response) { ... }
 * }
 * ```
 */
export function response(): ParameterDecorator {
  return makeParamDecorator(getResponse);
}

/**
 * An annotation factory for decorators which decorate arguments of type `Koa.Session`.
 *
 * ```typescript
 * @controller()
 * class MyController {
 *     @handler()
 *     myHandler(@session() session: Koa.Session) { ... }
 * }
 * ```
 */
export function session(): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    // TODO implement me
  };
}

export function body(): ParameterDecorator {
  return makeParamDecorator(getBody, null, null);
}

export function pathParam(key: string, pipe?: Type<IPipe>): ParameterDecorator {
  return makeParamDecorator(getPathParam, key, pipe);
}

export function queryParam(
  key: string,
  pipe?: Type<IPipe>,
): ParameterDecorator {
  return makeParamDecorator(getQueryParam, key, pipe);
}

export function headerParam(
  key: string,
  pipe?: Type<IPipe>,
): ParameterDecorator {
  return makeParamDecorator(getHeaderParam, key.toLowerCase(), pipe);
}

export function cookieParam(
  key: string,
  pipe?: Type<IPipe>,
): ParameterDecorator {
  return makeParamDecorator(getCookieParam, key, pipe);
}

export function formParam(name: string): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    // TODO implement me
  };
}

function makeParamDecorator(
  extractor: ParameterExtractor,
  key: string | null = null,
  pipe: Type<IPipe> | null = null,
): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    setParameterMetadata(target, propertyKey, {
      parameterIndex,
      extractor,
      key,
      pipe,
    });
  };
}
