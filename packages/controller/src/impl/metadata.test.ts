import {
  Context,
  type Handler,
  type Next,
  Request,
  Response,
} from "@fastr/core";
import { type RouterState } from "@fastr/middleware-router";
import test from "ava";
import { controller } from "../decorator/controller.js";
import { http } from "../decorator/handler.js";
import { use } from "../decorator/middleware.js";
import {
  body,
  cookieParam,
  headerParam,
  pathParam,
  queryParam,
} from "../decorator/parameter.js";
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
import {
  getControllerMetadata,
  getControllerUse,
  getHandlerMetadata,
  getHandlerUse,
  getParameterMetadata,
} from "./metadata.js";

function middleware1(ctx: Context<RouterState>, next: Next): Promise<void> {
  return next();
}

class Handler1 implements Handler {
  handle(ctx: Context<RouterState>, next: Next): Promise<void> {
    return next();
  }
}

test("get use middleware metadata on controller", (t) => {
  @controller()
  @use(middleware1)
  @use(Handler1)
  class Controller1 {}

  t.deepEqual(getControllerUse(Controller1), [middleware1, Handler1]);
});

test("get use middleware metadata on handler", (t) => {
  @controller()
  class Controller1 {
    @use(middleware1)
    @use(Handler1)
    index() {}
  }

  t.deepEqual(getHandlerUse(Controller1.prototype, "index"), [
    middleware1,
    Handler1,
  ]);
});

test("get controller metadata", (t) => {
  @controller("/prefix")
  class Controller1 {}

  t.deepEqual(getControllerMetadata(Controller1), {
    path: "/prefix",
  });
});

test("get handler metadata", (t) => {
  @controller()
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

test("get parameter metadata for framework objects", (t) => {
  @controller()
  class Controller1 {
    @http.get("/")
    index(ctx: Context, req: Request, res: Response) {}
  }

  t.deepEqual(getParameterMetadata(Controller1.prototype, "index"), [
    { parameterIndex: 0, extractor: getContext, key: null, pipe: null },
    { parameterIndex: 1, extractor: getRequest, key: null, pipe: null },
    { parameterIndex: 2, extractor: getResponse, key: null, pipe: null },
  ]);
});

test("get parameter metadata for request parameters", (t) => {
  @controller()
  class Controller1 {
    index(
      @body() value: unknown,
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
