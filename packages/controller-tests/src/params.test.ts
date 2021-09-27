import {
  context,
  controller,
  cookieParam,
  headerParam,
  http,
  pathParam,
  queryParam,
  request,
  response,
} from "@webfx/controller";
import test from "ava";
import { Container, injectable } from "inversify";
import Koa from "koa";
import { makeHelper } from "./helper.js";

test("should provide standard objects", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.get("/")
    index(
      @context() ctx: Koa.Context,
      @request() req: Koa.Request,
      @response() res: Koa.Response,
    ) {
      if (ctx == null || req == null || res == null) {
        throw new Error();
      }
      return "ok";
    }
  }

  const container = new Container();
  const { request: httpRequest } = makeHelper({
    container,
    controllers: [Controller1],
  });

  // Act.

  const { body } = await httpRequest.get("/").send();

  // Assert.

  t.is(await body.text(), "ok");
});

test("should provide parameters", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.get("/path/{value}")
    param(@pathParam("value") value: string | null) {
      return `pathParam=${format(value)}`;
    }

    @http.get("/query")
    query(@queryParam("Name") value: string | null) {
      return `queryParam=${format(value)}`;
    }

    @http.get("/header")
    header(@headerParam("X-Header-Name") value: string | null) {
      return `headerParam=${format(value)}`;
    }

    @http.get("/cookie")
    cookie(@cookieParam("Name") value: string | null) {
      return `cookieParam=${format(value)}`;
    }
  }

  const container = new Container();
  const { request: httpRequest } = makeHelper({
    container,
    controllers: [Controller1],
  });

  // Act. Assert.

  t.is(
    await (
      await httpRequest //
        .get("/path/ParamValue")
        .send()
    ).body.text(),
    "pathParam=[ParamValue]",
  );
  t.is(
    await (
      await httpRequest //
        .get("/query")
        .send()
    ).body.text(),
    "queryParam=null",
  );
  t.is(
    await (
      await httpRequest //
        .get("/query")
        .query({ Name: "QueryValue" })
        .send()
    ).body.text(),
    "queryParam=[QueryValue]",
  );
  t.is(
    await (
      await httpRequest //
        .get("/header")
        .send()
    ).body.text(),
    "headerParam=null",
  );
  t.is(
    await (
      await httpRequest //
        .get("/header")
        .header("X-Header-Name", "HeaderValue")
        .send()
    ).body.text(),
    "headerParam=[HeaderValue]",
  );
  t.is(
    await (
      await httpRequest //
        .get("/cookie")
        .send()
    ).body.text(),
    "cookieParam=null",
  );
  t.is(
    await (
      await httpRequest //
        .get("/cookie")
        .header("Cookie", "Name=CookieValue")
        .send()
    ).body.text(),
    "cookieParam=[CookieValue]",
  );
});

function format(value: string | null | undefined): string {
  if (value == null) {
    return `null`;
  } else {
    return `[${value}]`;
  }
}
