import {
  expectBinary,
  expectForm,
  expectJson,
  expectText,
} from "@webfx-middleware/body";
import { body, controller, http, use } from "@webfx/controller";
import test from "ava";
import { Container, injectable } from "inversify";
import { URLSearchParams } from "url";
import { makeHelper } from "./helper.js";

test("should provide binary bodies", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.post("/body")
    @use(expectBinary())
    body(@body() value: Buffer | null) {
      return `body=${format(value?.toString("utf8"))}`;
    }
  }

  const container = new Container();
  const { request: httpRequest } = makeHelper({
    container,
    controllers: [Controller1],
  });

  // Act. Assert.

  t.is(
    await (
      await httpRequest //
        .post("/body")
        .send(Buffer.from("binary body"))
    ).body.text(),
    "body=[binary body]",
  );
});

test("should provide text bodies", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.post("/body")
    @use(expectText())
    body(@body() value: string | null) {
      return `body=${format(value)}`;
    }
  }

  const container = new Container();
  const { request: httpRequest } = makeHelper({
    container,
    controllers: [Controller1],
  });

  // Act. Assert.

  t.is(
    await (
      await httpRequest //
        .post("/body")
        .send("text body")
    ).body.text(),
    "body=[text body]",
  );
});

test("should provide json bodies", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.post("/body")
    @use(expectJson())
    body(@body() value: unknown | null) {
      return `body=${format(JSON.stringify(value))}`;
    }
  }

  const container = new Container();
  const { request: httpRequest } = makeHelper({
    container,
    controllers: [Controller1],
  });

  // Act. Assert.

  t.is(
    await (
      await httpRequest //
        .post("/body")
        .send({ type: "json body" })
    ).body.text(),
    'body=[{"type":"json body"}]',
  );
});

test("should provide form bodies", async (t) => {
  // Arrange.

  @injectable()
  @controller()
  class Controller1 {
    @http.post("/body")
    @use(expectForm())
    formBody(@body() value: unknown | null) {
      return `body=${format(JSON.stringify(value))}`;
    }
  }

  const container = new Container();
  const { request: httpRequest } = makeHelper({
    container,
    controllers: [Controller1],
  });

  // Act. Assert.

  t.is(
    await (
      await httpRequest //
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
