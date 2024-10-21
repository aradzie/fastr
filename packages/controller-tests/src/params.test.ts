import {
  controller,
  cookieParam,
  headerParam,
  http,
  pathParam,
  type Pipe,
  type PipeObject,
  queryParam,
} from "@fastr/controller";
import { Context, Request, Response } from "@fastr/core";
import { injectable } from "@fastr/invert";
import test, { registerCompletionHandler } from "ava";
import { helper } from "./helper.js";

registerCompletionHandler(() => {
  process.exit();
});

test("provide standard objects", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.GET("/")
    index(ctx: Context, req: Request, res: Response) {
      if (ctx == null || req == null || res == null) {
        throw new Error();
      }
      return "ok";
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act.

  const { body } = await req.GET("/").send();

  // Assert.

  t.is(await body.text(), "ok");
});

test("provide parameters", async (t) => {
  // Arrange.

  const uppercase: Pipe = (ctx, value) => {
    if (typeof value === "string") {
      return value.toUpperCase();
    } else {
      return value;
    }
  };

  @injectable()
  @controller()
  class Controller1 {
    @http.GET("/path/{value}")
    param(@pathParam("value", uppercase) value: string | null) {
      return `pathParam=${format(value)}`;
    }

    @http.GET("/query")
    query(@queryParam("Name", uppercase) value: string | null) {
      return `queryParam=${format(value)}`;
    }

    @http.GET("/header")
    header(@headerParam("X-Header-Name", uppercase) value: string | null) {
      return `headerParam=${format(value)}`;
    }

    @http.GET("/cookie")
    cookie(@cookieParam("Name", uppercase) value: string | null) {
      return `cookieParam=${format(value)}`;
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.is(
    await (
      await req //
        .GET("/path/ParamValue")
        .send()
    ).body.text(),
    "pathParam=[PARAMVALUE]",
  );
  t.is(
    await (
      await req //
        .GET("/query")
        .send()
    ).body.text(),
    "queryParam=null",
  );
  t.is(
    await (
      await req //
        .GET("/query")
        .query({ Name: "QueryValue" })
        .send()
    ).body.text(),
    "queryParam=[QUERYVALUE]",
  );
  t.is(
    await (
      await req //
        .GET("/header")
        .send()
    ).body.text(),
    "headerParam=null",
  );
  t.is(
    await (
      await req //
        .GET("/header")
        .header("X-Header-Name", "HeaderValue")
        .send()
    ).body.text(),
    "headerParam=[HEADERVALUE]",
  );
  t.is(
    await (
      await req //
        .GET("/cookie")
        .send()
    ).body.text(),
    "cookieParam=null",
  );
  t.is(
    await (
      await req //
        .GET("/cookie")
        .header("Cookie", "Name=CookieValue")
        .send()
    ).body.text(),
    "cookieParam=[COOKIEVALUE]",
  );
});

test("pass through pipes", async (t) => {
  // Arrange.

  @injectable()
  class Integer implements PipeObject {
    parse(ctx: Context, value: unknown): unknown {
      if (typeof value === "string") {
        return Number(value);
      } else {
        return null;
      }
    }
  }

  @injectable()
  @controller()
  class Controller1 {
    @http.GET("/")
    query(@queryParam("value", Integer) value: unknown) {
      return { type: typeof value, value };
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.deepEqual(
    await (
      await req //
        .GET("/")
        .send()
    ).body.json(),
    {
      type: "object",
      value: null,
    },
  );
  t.deepEqual(
    await (
      await req //
        .GET("/?value=123")
        .send()
    ).body.json(),
    {
      type: "number",
      value: 123,
    },
  );
});

function format(value: string | null | undefined): string {
  if (value == null) {
    return `null`;
  } else {
    return `[${value}]`;
  }
}
