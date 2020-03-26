import { Body, type BodyOptions } from "@fastr/body";
import { type Context } from "@fastr/core";
import { UnsupportedMediaTypeError } from "@fastr/errors";
import { makeParameterDecorator } from "../impl/parameter.js";
import { type AnyPipe } from "../pipe.js";

export namespace body {
  type ExtraBodyOptions = BodyOptions & {
    readonly expectType?: string;
  };

  const T_TEXT = "text/plain";
  const T_BINARY = "application/octet-stream";
  const T_JSON = "application/json";
  const T_URL_ENCODED = "application/x-www-form-urlencoded";

  const defaultOptions: BodyOptions = {};

  export const setDefaultOptions = (o: BodyOptions) => {
    Object.assign(defaultOptions, o);
  };

  export function text(
    pipe: AnyPipe | null = null,
    options: ExtraBodyOptions = {},
  ): ParameterDecorator {
    const { expectType = T_TEXT, ...opts } = options;

    const getBody = async (ctx: Context): Promise<unknown> => {
      if (!ctx.request.is(expectType)) {
        throw new UnsupportedMediaTypeError();
      }
      return await Body.from(ctx.request.req, {
        ...defaultOptions,
        ...opts,
      }).text();
    };

    return makeParameterDecorator(getBody, null, pipe);
  }

  export function binary(
    pipe: AnyPipe | null = null,
    options: ExtraBodyOptions = {},
  ): ParameterDecorator {
    const { expectType = T_BINARY, ...opts } = options;

    const getBody = async (ctx: Context): Promise<unknown> => {
      if (!ctx.request.is(expectType)) {
        throw new UnsupportedMediaTypeError();
      }
      return await Body.from(ctx.request.req, {
        ...defaultOptions,
        ...opts,
      }).buffer();
    };

    return makeParameterDecorator(getBody, null, pipe);
  }

  export function json(
    pipe: AnyPipe | null = null,
    options: ExtraBodyOptions = {},
  ): ParameterDecorator {
    const { expectType = T_JSON, ...opt } = options;

    const getBody = async (ctx: Context): Promise<unknown> => {
      if (!ctx.request.is(expectType)) {
        throw new UnsupportedMediaTypeError();
      }
      return await Body.from(ctx.request.req, {
        ...defaultOptions,
        ...opt,
      }).json();
    };

    return makeParameterDecorator(getBody, null, pipe);
  }

  export function form(
    pipe: AnyPipe | null = null,
    options: ExtraBodyOptions = {},
  ): ParameterDecorator {
    const { expectType = T_URL_ENCODED, ...opts } = options;

    const getBody = async (ctx: Context): Promise<unknown> => {
      if (!ctx.request.is(expectType)) {
        throw new UnsupportedMediaTypeError();
      }
      return await Body.from(ctx.request.req, {
        ...defaultOptions,
        ...opts,
      }).form();
    };

    return makeParameterDecorator(getBody, null, pipe);
  }
}
