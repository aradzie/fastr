import { controller, http, response } from "@webfx/controller";
import test from "ava";
import { Container, injectable } from "inversify";
import Koa from "koa";
import { makeHelper } from "./helper.js";

test("should handle HTTP methods", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.del("/")
    executeDelete(@response() response: Koa.Response) {
      response.set("X-Result", "delete");
    }

    @http.get({ name: "index" })
    executeGet(@response() response: Koa.Response) {
      response.set("X-Result", "get");
    }

    @http.patch("/")
    executePatch(@response() response: Koa.Response) {
      response.set("X-Result", "patch");
    }

    @http.post("/")
    executePost(@response() response: Koa.Response) {
      response.set("X-Result", "post");
    }

    @http.put("/")
    executePut(@response() response: Koa.Response) {
      response.set("X-Result", "put");
    }
  }

  const container = new Container();
  const { request } = makeHelper({
    container,
    controllers: [Controller1],
  });

  // Act. Assert.

  t.is(
    (
      await request //
        .delete("/")
        .send()
    ).headers.get("X-Result"),
    "delete",
  );
  t.is(
    (
      await request //
        .get("/")
        .send()
    ).headers.get("X-Result"),
    "get",
  );
  t.is(
    (
      await request //
        .patch("/")
        .send()
    ).headers.get("X-Result"),
    "patch",
  );
  t.is(
    (
      await request //
        .post("/")
        .send()
    ).headers.get("X-Result"),
    "post",
  );
  t.is(
    (
      await request //
        .put("/")
        .send()
    ).headers.get("X-Result"),
    "put",
  );
});
