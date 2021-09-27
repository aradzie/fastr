import { controller, http, response } from "@webfx/controller";
import test from "ava";
import { Container, injectable } from "inversify";
import Koa from "koa";
import { makeHelper } from "./helper.js";

test("should handle HTTP methods", async (t) => {
  // Arrange.

  @injectable()
  @controller("/x")
  class Controller1 {
    @http.get("/")
    @http.header("X-Result", "/x/index")
    index(@response() response: Koa.Response) {
      response.set("X-Result", "/x/index");
    }

    @http.get("/a")
    @http.header("X-Result", "/x/a")
    a(@response() response: Koa.Response) {
      response.set("X-Result", "/x/a");
    }
  }

  @injectable()
  @controller("/y")
  class Controller2 {
    @http.get("/")
    @http.header("X-Result", "/y/index")
    index(@response() response: Koa.Response) {
      response.set("X-Result", "/y/index");
    }

    @http.get("/b")
    @http.header("X-Result", "/y/b")
    b(@response() response: Koa.Response) {
      response.set("X-Result", "/y/b");
    }
  }

  const container = new Container();
  const { request } = makeHelper({
    container,
    controllers: [Controller1, Controller2],
  });

  // Act. Assert.

  t.is(
    (
      await request //
        .get("/x")
        .send()
    ).headers.get("X-Result"),
    "/x/index",
  );
  t.is(
    (
      await request //
        .get("/x/a")
        .send()
    ).headers.get("X-Result"),
    "/x/a",
  );
  t.is(
    (
      await request //
        .get("/y")
        .send()
    ).headers.get("X-Result"),
    "/y/index",
  );
  t.is(
    (
      await request //
        .get("/y/b")
        .send()
    ).headers.get("X-Result"),
    "/y/b",
  );
});
