import { type Newable } from "@fastr/core";
import {
  getBody,
  getCookieParam,
  getFormParam,
  getHeaderParam,
  getPathParam,
  getQueryParam,
} from "../impl/context.js";
import { type PropertyKey } from "../impl/types.js";
import { type ParameterExtractor, setParameterMetadata } from "../metadata.js";
import { type Pipe } from "../pipe.js";

const makeParameterDecorator = (
  extractor: ParameterExtractor,
  key: string | null,
  pipe: Newable<Pipe> | null,
) => {
  return ((
    target: object,
    propertyKey: PropertyKey,
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
  }) as ParameterDecorator;
};

export let body = (): ParameterDecorator => {
  return makeParameterDecorator(getBody, null, null);
};

export const pathParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getPathParam, key, pipe);
};

export const queryParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getQueryParam, key, pipe);
};

export const headerParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getHeaderParam, key.toLowerCase(), pipe);
};

export const cookieParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getCookieParam, key, pipe);
};

export const formParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getFormParam, key, pipe);
};
