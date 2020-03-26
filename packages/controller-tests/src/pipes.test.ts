import { controller, http, type Pipe, queryParam } from "@fastr/controller";
import { type Context } from "@fastr/core";
import { type RouterState } from "@fastr/middleware-router";
import { injectable } from "@sosimple/inversify";
import test from "ava";
import { helper } from "./helper.js";

test("pass through pipes", async (t) => {
  // Arrange.

  @injectable()
  class ParseInt implements Pipe {
    transform(ctx: Context<RouterState>, value: string): unknown {
      return Number.parseInt(value, 10);
    }
  }

  @injectable()
  @controller()
  class Controller1 {
    @http.get("/")
    query(@queryParam("value", ParseInt) value: number | null) {
      return { type: typeof value, value };
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.deepEqual(
    await (
      await req //
        .get("/")
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
        .get("/?value=123")
        .send()
    ).body.json(),
    {
      type: "number",
      value: 123,
    },
  );
});
