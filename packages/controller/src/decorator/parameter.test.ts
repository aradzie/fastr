import { Context, Request, Response } from "@fastr/core";
import test from "ava";
import {
  getContext,
  getCookieParam,
  getHeaderParam,
  getPathParam,
  getQueryParam,
  getRequest,
  getResponse,
} from "../impl/context.js";
import { getParameterMetadata } from "../impl/metadata.js";
import { type Pipe } from "../pipe.js";
import { controller } from "./controller.js";
import { http } from "./handler.js";
import {
  cookieParam,
  headerParam,
  pathParam,
  queryParam,
} from "./parameter.js";

test("get parameter metadata for framework objects", (t) => {
  @controller()
  class Controller1 {
    @http.GET("/")
    index(ctx: Context, req: Request, res: Response) {}
  }

  t.deepEqual(getParameterMetadata(Controller1.prototype, "index"), [
    { parameterIndex: 0, provider: getContext, key: null, pipe: null },
    { parameterIndex: 1, provider: getRequest, key: null, pipe: null },
    { parameterIndex: 2, provider: getResponse, key: null, pipe: null },
  ]);
});

test("get parameter metadata for request parameters", (t) => {
  const pipe1: Pipe = (ctx, value) => value;

  @controller()
  class Controller1 {
    index(
      @pathParam("path1", pipe1) path: string,
      @queryParam("query1", pipe1) query: string,
      @headerParam("header1", pipe1) header: string,
      @cookieParam("cookie1", pipe1) cookie: string,
    ) {}
  }

  t.deepEqual(getParameterMetadata(Controller1.prototype, "index"), [
    {
      parameterIndex: 0,
      provider: getPathParam,
      key: "path1",
      pipe: pipe1,
    },
    {
      parameterIndex: 1,
      provider: getQueryParam,
      key: "query1",
      pipe: pipe1,
    },
    {
      parameterIndex: 2,
      provider: getHeaderParam,
      key: "header1",
      pipe: pipe1,
    },
    {
      parameterIndex: 3,
      provider: getCookieParam,
      key: "cookie1",
      pipe: pipe1,
    },
  ]);
});
