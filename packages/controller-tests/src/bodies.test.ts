import { body, controller, http, use } from "@fastr/controller";
import { injectable } from "@fastr/invert";
import {
  expectBinary,
  expectForm,
  expectJson,
  expectText,
} from "@fastr/middleware-body";
import test from "ava";
import { helper } from "./helper.js";

test("provide binary bodies", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.post("/body")
    @use(expectBinary())
    body(@body() value: Buffer) {
      return `body=${format(value?.toString("utf8"))}`;
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.is(
    await (
      await req //
        .post("/body")
        .send(Buffer.from("binary body"))
    ).body.text(),
    "body=[binary body]",
  );
});

test("provide text bodies", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.post("/body")
    @use(expectText())
    body(@body() value: string) {
      return `body=${format(value)}`;
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.is(
    await (
      await req //
        .post("/body")
        .send("text body")
    ).body.text(),
    "body=[text body]",
  );
});

test("provide json bodies", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.post("/body")
    @use(expectJson())
    body(@body() value: unknown) {
      return `body=${format(JSON.stringify(value))}`;
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.is(
    await (
      await req //
        .post("/body")
        .send({ type: "json body" })
    ).body.text(),
    'body=[{"type":"json body"}]',
  );
});

test("provide form bodies", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.post("/body")
    @use(expectForm())
    formBody(@body() value: unknown) {
      return `body=${format(JSON.stringify(value))}`;
    }
  }

  const req = helper(null, [], [Controller1]);

  // Act. Assert.

  t.is(
    await (
      await req //
        .post("/body")
        .send(new URLSearchParams([["type", "form body"]]))
    ).body.text(),
    'body=[{"type":"form body"}]',
  );
});

function format(value: string | null | undefined): string {
  if (value == null) {
    return `null`;
  } else {
    return `[${value}]`;
  }
}
