import { controller, http } from "@fastr/controller";
import { Response } from "@fastr/core";
import { injectable } from "@fastr/invert";
import test from "ava";
import { helper } from "./helper.js";

test("handle HTTP methods", async (t) => {
  // Arrange.

  @injectable()
  @controller("/x")
  class Controller1 {
    @http.GET("/")
    @http.header("X-Result", "/x/index")
    index(res: Response) {
      res.headers.set("X-Result", "/x/index");
    }

    @http.GET("/a")
    @http.header("X-Result", "/x/a")
    a(res: Response) {
      res.headers.set("X-Result", "/x/a");
    }
  }

  @injectable()
  @controller("/y")
  class Controller2 {
    @http.GET("/")
    @http.header("X-Result", "/y/index")
    index(res: Response) {
      res.headers.set("X-Result", "/y/index");
    }

    @http.GET("/b")
    @http.header("X-Result", "/y/b")
    b(res: Response) {
      res.headers.set("X-Result", "/y/b");
    }
  }

  const req = helper(null, [], [Controller1, Controller2]);

  // Act. Assert.

  t.is(
    (
      await req //
        .GET("/x")
        .send()
    ).headers.get("X-Result"),
    "/x/index",
  );
  t.is(
    (
      await req //
        .GET("/x/a")
        .send()
    ).headers.get("X-Result"),
    "/x/a",
  );
  t.is(
    (
      await req //
        .GET("/y")
        .send()
    ).headers.get("X-Result"),
    "/y/index",
  );
  t.is(
    (
      await req //
        .GET("/y/b")
        .send()
    ).headers.get("X-Result"),
    "/y/b",
  );
});
