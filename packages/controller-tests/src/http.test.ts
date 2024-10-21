import { controller, http } from "@fastr/controller";
import { Response } from "@fastr/core";
import { injectable } from "@fastr/invert";
import test, { registerCompletionHandler } from "ava";
import { helper } from "./helper.js";

registerCompletionHandler(() => {
  process.exit();
});

test("methods", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.DELETE("/")
    @http.header("X-Result", "DELETE")
    DELETE() {
      return "DELETE";
    }

    @http.GET({ name: "index" })
    @http.header("X-Result", "GET")
    GET() {
      return "GET";
    }

    @http.PATCH("/")
    @http.header("X-Result", "PATCH")
    PATCH() {
      return "PATCH";
    }

    @http.POST("/")
    @http.header("X-Result", "POST")
    POST() {
      return "POST";
    }

    @http.PUT("/")
    @http.header("X-Result", "PUT")
    PUT() {
      return "PUT";
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.is(
    (
      await req //
        .DELETE("/")
        .send()
    ).headers.get("X-Result"),
    "DELETE",
  );
  t.is(
    (
      await req //
        .GET("/")
        .send()
    ).headers.get("X-Result"),
    "GET",
  );
  t.is(
    (
      await req //
        .PATCH("/")
        .send()
    ).headers.get("X-Result"),
    "PATCH",
  );
  t.is(
    (
      await req //
        .POST("/")
        .send()
    ).headers.get("X-Result"),
    "POST",
  );
  t.is(
    (
      await req //
        .PUT("/")
        .send()
    ).headers.get("X-Result"),
    "PUT",
  );
});

test("set headers and body", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.GET("/")
    @http.header("X-Foo", "a")
    @http.header("X-Bar", "b")
    @http.type("text/html")
    handle(res: Response) {
      res.body = "oh";
      return "ok";
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act.

  const res = await req.GET("/").send();

  // Assert.

  t.like(res, {
    status: 200,
    statusText: "OK",
  });
  t.is(res.headers.get("X-Foo"), "a");
  t.is(res.headers.get("X-Bar"), "b");
  t.is(res.headers.get("Content-Type"), "text/html; charset=UTF-8");
  t.is(await res.body.text(), "ok");
});

test("set headers and body in response", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.GET("/")
    handle(res: Response) {
      res.headers.set("X-Foo", "a");
      res.headers.set("X-Bar", "b");
      res.body = "ok";
      res.type = "text/html";
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act.

  const res = await req.GET("/").send();

  // Assert.

  t.like(res, {
    status: 200,
    statusText: "OK",
  });
  t.is(res.headers.get("X-Foo"), "a");
  t.is(res.headers.get("X-Bar"), "b");
  t.is(res.headers.get("Content-Type"), "text/html; charset=UTF-8");
  t.is(await res.body.text(), "ok");
});
