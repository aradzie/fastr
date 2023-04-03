import { type Newable } from "@fastr/core";
import {
  getBody,
  getCookieParam,
  getFormParam,
  getHeaderParam,
  getPathParam,
  getQueryParam,
} from "../context.js";
import { type ParameterExtractor, setParameterMetadata } from "../metadata.js";
import { type Pipe } from "../pipe.js";

export function body(): ParameterDecorator {
  return makeParamDecorator(getBody, null, null);
}

export function pathParam(
  key: string,
  pipe?: Newable<Pipe>,
): ParameterDecorator {
  return makeParamDecorator(getPathParam, key, pipe);
}

export function queryParam(
  key: string,
  pipe?: Newable<Pipe>,
): ParameterDecorator {
  return makeParamDecorator(getQueryParam, key, pipe);
}

export function headerParam(
  key: string,
  pipe?: Newable<Pipe>,
): ParameterDecorator {
  return makeParamDecorator(getHeaderParam, key.toLowerCase(), pipe);
}

export function cookieParam(
  key: string,
  pipe?: Newable<Pipe>,
): ParameterDecorator {
  return makeParamDecorator(getCookieParam, key, pipe);
}

export function formParam(
  key: string,
  pipe?: Newable<Pipe>,
): ParameterDecorator {
  return makeParamDecorator(getFormParam, key, pipe);
}

function makeParamDecorator(
  extractor: ParameterExtractor,
  key: string | null = null,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ): void => {
    if (propertyKey == null) {
      throw new TypeError();
    }
    setParameterMetadata(target, propertyKey, {
      parameterIndex,
      extractor,
      key,
      pipe,
    });
  };
}
