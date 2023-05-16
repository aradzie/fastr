import { Context, Request, Response } from "@fastr/core";
import { Container } from "@fastr/invert";
import { type BodyState } from "@fastr/middleware-body";
import { Router, type RouterState } from "@fastr/middleware-router";
import { type Session, type SessionState } from "@fastr/middleware-session";

export type ParameterExtractor = (
  ctx: Context<RouterState>,
  key: string | null,
) => any;

export const getStandardExtractor = (
  type: unknown,
): ParameterExtractor | null => {
  switch (type) {
    case Context:
      return getContext;
    case Container:
      return getContainer;
    case Request:
      return getRequest;
    case Response:
      return getResponse;
    case Router:
      return getRouter;
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

export const getRouter = (ctx: Context): Router => {
  const { state } = ctx as Context<RouterState>;
  const { router } = state;
  if (router == null) {
    throw new Error(
      "No router. Did you forget to use the router middleware?", //
    );
  }
  return router;
};

export const getSession = (ctx: Context): Session => {
  const { state } = ctx as Context<SessionState>;
  const { session } = state;
  if (session == null) {
    throw new Error(
      "No session. Did you forget to use the session middleware?", //
    );
  }
  return session;
};

export const getBody = (ctx: Context): unknown => {
  const { state } = ctx as Context<BodyState>;
  const body =
    state.binaryBody ??
    state.textBody ??
    state.jsonBody ??
    state.formBody ??
    null;
  if (body == null) {
    throw new Error(
      "No body. Did you forget to use the body middleware?", //
    );
  }
  return body;
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
  return ctx.request.query[key!] ?? null;
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

export const getFormParam = (
  ctx: Context,
  key: string | null,
): string | null => {
  throw new TypeError("Not implemented");
};
