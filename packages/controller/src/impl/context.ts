import { Context, Request, Response } from "@fastr/core";
import { Container } from "@fastr/invert";

export type ParameterProvider = (ctx: Context, key: string | null) => any;

export const getStandardProvider = (
  type: unknown,
): ParameterProvider | null => {
  switch (type) {
    case Context:
      return getContext;
    case Container:
      return getContainer;
    case Request:
      return getRequest;
    case Response:
      return getResponse;
  }
  return null;
};

export const getContext = (ctx: Context): Context => {
  return ctx;
};

export const getContainer = (ctx: Context): Container => {
  return ctx.container;
};

export const getRequest = (ctx: Context): Request => {
  return ctx.request;
};

export const getResponse = (ctx: Context): Response => {
  return ctx.response;
};

export const getPathParam = (
  ctx: Context,
  key: string | null,
): string | null => {
  return (ctx.state.params[key!] as string) ?? null;
};

export const getQueryParam = (
  ctx: Context,
  key: string | null,
): string | null => {
  return ctx.request.query.get(key!);
};

export const getHeaderParam = (
  ctx: Context,
  key: string | null,
): string | null => {
  return ctx.request.headers.get(key!);
};

export const getCookieParam = (
  ctx: Context,
  key: string | null,
): string | null => {
  return ctx.cookies.get(key!);
};
