import { Body, type BodyOptions } from "@fastr/body";
import { type Context, type Middleware, type Next } from "@fastr/core";
import { UnsupportedMediaTypeError } from "@fastr/errors";

export interface BinaryBodyState {
  body: Buffer;
}

export interface TextBodyState {
  body: string;
}

export interface JsonBodyState<T = any> {
  body: T;
}

export interface FormBodyState<T = any> {
  body: T;
}

export function expectBinary(
  mimeType = "application/octet-stream",
  options?: BodyOptions,
): Middleware<BinaryBodyState> {
  return async (ctx: Context<BinaryBodyState>, next: Next): Promise<void> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.state.body = await Body.from(ctx.request.req, options).buffer();

    await next();
  };
}

export function expectText(
  mimeType = "text/plain",
  options?: BodyOptions,
): Middleware<TextBodyState> {
  return async (ctx: Context<TextBodyState>, next: Next): Promise<void> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.state.body = await Body.from(ctx.request.req, options).text();

    await next();
  };
}

export function expectJson<T = any>(
  mimeType = "application/json",
  options?: BodyOptions,
): Middleware<JsonBodyState<T>> {
  return async (ctx: Context<JsonBodyState>, next: Next): Promise<void> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.state.body = await Body.from(ctx.request.req, options).json();

    await next();
  };
}

export function expectForm<T = any>(
  mimeType = "application/x-www-form-urlencoded",
  options?: BodyOptions,
): Middleware<FormBodyState<T>> {
  return async (ctx: Context<FormBodyState>, next: Next): Promise<void> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.state.body = await Body.from(ctx.request.req, options).form();

    await next();
  };
}
