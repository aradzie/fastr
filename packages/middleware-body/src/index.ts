import { Body, type BodyOptions } from "@fastr/body";
import { type Context, type Middleware, type Next } from "@fastr/core";
import { UnsupportedMediaTypeError } from "@fastr/errors";

export interface BodyState {
  binaryBody: Buffer;
  textBody: string;
  jsonBody: any;
  formBody: any;
}

export function expectBinary(
  mimeType = "application/octet-stream",
  options?: BodyOptions,
): Middleware<BodyState> {
  return async (ctx: Context<BodyState>, next: Next): Promise<void> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.state.binaryBody = await Body.from(ctx.request.req, options).buffer();

    await next();
  };
}

export function expectText(
  mimeType = "text/plain",
  options?: BodyOptions,
): Middleware<BodyState> {
  return async (ctx: Context<BodyState>, next: Next): Promise<void> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.state.textBody = await Body.from(ctx.request.req, options).text();

    await next();
  };
}

export function expectJson(
  mimeType = "application/json",
  options?: BodyOptions,
): Middleware<BodyState> {
  return async (ctx: Context<BodyState>, next: Next): Promise<void> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.state.jsonBody = await Body.from(ctx.request.req, options).json();

    await next();
  };
}

export function expectForm(
  mimeType = "application/x-www-form-urlencoded",
  options?: BodyOptions,
): Middleware<BodyState> {
  return async (ctx: Context<BodyState>, next: Next): Promise<void> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.state.formBody = await Body.from(ctx.request.req, options).form();

    await next();
  };
}
