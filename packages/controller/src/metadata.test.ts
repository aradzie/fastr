import type { RouterContext } from "@webfx-middleware/router";
import type { IMiddleware } from "@webfx/middleware";
import test from "ava";
import type Koa from "koa";
import {
  getBody,
  getContext,
  getCookieParam,
  getHeaderParam,
  getPathParam,
  getQueryParam,
  getRequest,
  getResponse,
} from "./context.js";
import { controller } from "./decorator/controller.js";
import { http } from "./decorator/handler.js";
import { use } from "./decorator/middleware.js";
import {
  body,
  context,
  cookieParam,
  headerParam,
  pathParam,
  queryParam,
  request,
  response,
} from "./decorator/parameter.js";
import {
  getControllerMetadata,
  getControllerUse,
  getHandlerMetadata,
  getHandlerUse,
  getParameterMetadata,
} from "./metadata.js";

function middleware1(ctx: RouterContext, next: Koa.Next): Promise<void> {
  return next();
}

class Middleware1 implements IMiddleware {
  handle(ctx: RouterContext, next: Koa.Next): Promise<void> {
    return next();
  }
}

test("should extract use middleware metadata on controller", (t) => {
  @use(middleware1)
  @use(Middleware1)
  class Controller1 {}

  t.deepEqual(getControllerUse(Controller1), [middleware1, Middleware1]);
});

test("should extract use middleware metadata on handler", (t) => {
  class Controller1 {
    @use(middleware1)
    @use(Middleware1)
    index() {}
  }

  t.deepEqual(getHandlerUse(Controller1.prototype, "index"), [
    middleware1,
    Middleware1,
  ]);
});

test("should extract controller metadata", (t) => {
  @controller("/prefix")
  class Controller1 {}

  t.deepEqual(getControllerMetadata(Controller1), {
    path: "/prefix",
  });
});

test("should extract handler metadata", (t) => {
  class Controller1 {
    @http.get({ name: "index" })
    a() {}

    @http.post("/post/:id")
    b() {}
  }

  t.deepEqual(getHandlerMetadata(Controller1.prototype, "a"), {
    method: "GET",
    path: "/",
    name: "index",
  });
  t.deepEqual(getHandlerMetadata(Controller1.prototype, "b"), {
    method: "POST",
    path: "/post/:id",
    name: null,
  });
});

test("should extract parameter metadata for framework objects", (t) => {
  class Controller1 {
    index(
      @context() ctx: Koa.Context,
      @request() req: Koa.Request,
      @response() res: Koa.Response,
    ) {}
  }

  t.deepEqual(getParameterMetadata(Controller1.prototype, "index"), [
    { parameterIndex: 0, extractor: getContext, key: null, pipe: null },
    { parameterIndex: 1, extractor: getRequest, key: null, pipe: null },
    { parameterIndex: 2, extractor: getResponse, key: null, pipe: null },
  ]);
});

test("should extract parameter metadata for request parameters", (t) => {
  class Controller1 {
    index(
      @body() body: any,
      @pathParam("pathId") path: string | null,
      @queryParam("queryId") query: string | null,
      @headerParam("headerId") header: string | null,
      @cookieParam("cookieId") cookie: string | null,
    ) {}
  }

  t.deepEqual(getParameterMetadata(Controller1.prototype, "index"), [
    { parameterIndex: 0, extractor: getBody, key: null, pipe: null },
    { parameterIndex: 1, extractor: getPathParam, key: "pathId", pipe: null },
    { parameterIndex: 2, extractor: getQueryParam, key: "queryId", pipe: null },
    {
      parameterIndex: 3,
      extractor: getHeaderParam,
      key: "headerid",
      pipe: null,
    },
    {
      parameterIndex: 4,
      extractor: getCookieParam,
      key: "cookieId",
      pipe: null,
    },
  ]);
});
