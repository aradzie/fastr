import { expectText } from "@webfx-middleware/body";
import {
  body,
  context,
  controller,
  cookieParam,
  headerParam,
  http,
  pathParam,
  queryParam,
  request,
  response,
  use,
} from "@webfx/controller";
import test from "ava";
import { Container, injectable } from "inversify";
import Koa from "koa";
import { newSuperTest } from "./util";

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
  const { agent } = newSuperTest({
    container,
    middlewares: [],
    controllers: [Controller1],
  });

  // Act.

  const { text } = await agent.get("/").send();

  // Assert.

  t.is(text, "ok");
});

test("should provide parameters", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.post("/body")
    @use(expectText())
    body(@body() value: string | null) {
      return `body=${format(value)}`;
    }

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
  const { agent } = newSuperTest({
    container,
    middlewares: [],
    controllers: [Controller1],
  });

  // Act. Assert.

  t.is(
    (await agent.post("/body").type("text").send("BodyValue")).text,
    "body=[BodyValue]",
  );
  t.is(
    (await agent.get("/path/ParamValue").send()).text,
    "pathParam=[ParamValue]",
  );
  t.is((await agent.get("/query").send()).text, "queryParam=null");
  t.is(
    (await agent.get("/query").query({ Name: "QueryValue" }).send()).text,
    "queryParam=[QueryValue]",
  );
  t.is((await agent.get("/header").send()).text, "headerParam=null");
  t.is(
    (await agent.get("/header").set("X-Header-Name", "HeaderValue").send())
      .text,
    "headerParam=[HeaderValue]",
  );
  t.is((await agent.get("/cookie").send()).text, "cookieParam=null");
  t.is(
    (await agent.get("/cookie").set("Cookie", "Name=CookieValue").send()).text,
    "cookieParam=[CookieValue]",
  );
});

function format(value: string | null) {
  if (value == null) {
    return `null`;
  } else {
    return `[${value}]`;
  }
}
