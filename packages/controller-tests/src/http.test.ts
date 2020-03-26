import { controller, http } from "@fastr/controller";
import { Response } from "@fastr/core";
import { injectable } from "@sosimple/inversify";
import test from "ava";
import { helper } from "./helper.js";

test("handle HTTP methods", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.del("/")
    executeDelete(res: Response) {
      res.headers.set("X-Result", "delete");
    }

    @http.get({ name: "index" })
    executeGet(res: Response) {
      res.headers.set("X-Result", "get");
    }

    @http.patch("/")
    executePatch(res: Response) {
      res.headers.set("X-Result", "patch");
    }

    @http.post("/")
    executePost(res: Response) {
      res.headers.set("X-Result", "post");
    }

    @http.put("/")
    executePut(res: Response) {
      res.headers.set("X-Result", "put");
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.is(
    (
      await req //
        .delete("/")
        .send()
    ).headers.get("X-Result"),
    "delete",
  );
  t.is(
    (
      await req //
        .get("/")
        .send()
    ).headers.get("X-Result"),
    "get",
  );
  t.is(
    (
      await req //
        .patch("/")
        .send()
    ).headers.get("X-Result"),
    "patch",
  );
  t.is(
    (
      await req //
        .post("/")
        .send()
    ).headers.get("X-Result"),
    "post",
  );
  t.is(
    (
      await req //
        .put("/")
        .send()
    ).headers.get("X-Result"),
    "put",
  );
});

test("set HTTP headers", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.get("/")
    @http.header("X-Foo", "a")
    @http.header("X-Bar", "b")
    handle(res: Response) {
      return "ok";
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act.

  const res = await req.get("/").send();

  // Assert.

  t.is(res.headers.get("X-Foo"), "a");
  t.is(res.headers.get("X-Bar"), "b");
});
