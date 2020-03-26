import { Body, BodyOptions } from "@webfx-http/body";
import { UnsupportedMediaTypeError } from "@webfx-http/error";
import Koa from "koa";

declare module "koa" {
  interface Request {
    buffer: Buffer;
    text: string;
    json: any;
    form: any;
  }
}

export function expectBinary(
  mimeType = "application/octet-stream",
  options?: BodyOptions,
): Koa.Middleware {
  return async (
    ctx: Koa.ParameterizedContext,
    next: Koa.Next,
  ): Promise<any> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.request.buffer = await Body.from(ctx.req, options).buffer();

    await next();
  };
}

export function expectText(
  mimeType = "text/plain",
  options?: BodyOptions,
): Koa.Middleware {
  return async (
    ctx: Koa.ParameterizedContext,
    next: Koa.Next,
  ): Promise<any> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.request.text = await Body.from(ctx.req, options).text();

    await next();
  };
}

export function expectJson(
  mimeType = "application/json",
  options?: BodyOptions,
): Koa.Middleware {
  return async (
    ctx: Koa.ParameterizedContext,
    next: Koa.Next,
  ): Promise<any> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.request.json = await Body.from(ctx.req, options).json();

    await next();
  };
}

export function expectForm(
  mimeType = "application/x-www-form-urlencoded",
  options?: BodyOptions,
): Koa.Middleware {
  return async (
    ctx: Koa.ParameterizedContext,
    next: Koa.Next,
  ): Promise<any> => {
    if (!ctx.request.is(mimeType)) {
      throw new UnsupportedMediaTypeError();
    }
    ctx.request.form = await Body.from(ctx.req, options).form();

    await next();
  };
}
