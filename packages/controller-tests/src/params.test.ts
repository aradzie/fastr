import {
  controller,
  cookieParam,
  headerParam,
  http,
  pathParam,
  queryParam,
} from "@fastr/controller";
import { Context, Request, Response } from "@fastr/core";
import { injectable } from "@fastr/invert";
import test from "ava";
import { helper } from "./helper.js";

test("provide standard objects", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.get("/")
    index(ctx: Context, req: Request, res: Response) {
      if (ctx == null || req == null || res == null) {
        throw new Error();
      }
      return "ok";
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act.

  const { body } = await req.get("/").send();

  // Assert.

  t.is(await body.text(), "ok");
});

test("provide parameters", async (t) => {
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

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.is(
    await (
      await req //
        .get("/path/ParamValue")
        .send()
    ).body.text(),
    "pathParam=[ParamValue]",
  );
  t.is(
    await (
      await req //
        .get("/query")
        .send()
    ).body.text(),
    "queryParam=null",
  );
  t.is(
    await (
      await req //
        .get("/query")
        .query({ Name: "QueryValue" })
        .send()
    ).body.text(),
    "queryParam=[QueryValue]",
  );
  t.is(
    await (
      await req //
        .get("/header")
        .send()
    ).body.text(),
    "headerParam=null",
  );
  t.is(
    await (
      await req //
        .get("/header")
        .header("X-Header-Name", "HeaderValue")
        .send()
    ).body.text(),
    "headerParam=[HeaderValue]",
  );
  t.is(
    await (
      await req //
        .get("/cookie")
        .send()
    ).body.text(),
    "cookieParam=null",
  );
  t.is(
    await (
      await req //
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
