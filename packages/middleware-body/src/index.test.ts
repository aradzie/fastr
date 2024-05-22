import { brotliCompressSync, gzipSync } from "node:zlib";
import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import test from "ava";
import { expectBinary, expectForm, expectJson, expectText } from "./index.js";

test("expect binary", async (t) => {
  const app = new Application() //
    .use(expectBinary())
    .use((ctx) => {
      ctx.response.body = "ok";
      t.not(ctx.state.body, null);
    });
  const req = request.use(start(app.callback()));

  t.is(
    (
      await req //
        .POST("/")
        .type("application/octet-stream")
        .send("something")
    ).status,
    200,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("text/plain")
        .send("text")
    ).status,
    415,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("application/json")
        .send("{}")
    ).status,
    415,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("application/x-www-form-urlencoded")
        .send("a=1")
    ).status,
    415,
  );
});

test("expect text", async (t) => {
  const app = new Application() //
    .use(expectText())
    .use((ctx) => {
      ctx.response.body = "ok";
      t.not(ctx.state.body, null);
    });
  const req = request.use(start(app.callback()));

  t.is(
    (
      await req //
        .POST("/")
        .type("application/octet-stream")
        .send("something")
    ).status,
    415,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("text/plain")
        .send("text")
    ).status,
    200,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("application/json")
        .send("{}")
    ).status,
    415,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("application/x-www-form-urlencoded")
        .send("a=1")
    ).status,
    415,
  );
});

test("expect json", async (t) => {
  const app = new Application() //
    .use(expectJson())
    .use((ctx) => {
      ctx.response.body = "ok";
      t.not(ctx.state.body, null);
    });
  const req = request.use(start(app.callback()));

  t.is(
    (
      await req //
        .POST("/")
        .type("application/octet-stream")
        .send("something")
    ).status,
    415,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("text/plain")
        .send("text")
    ).status,
    415,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("application/json")
        .send("{}")
    ).status,
    200,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("application/x-www-form-urlencoded")
        .send("a=1")
    ).status,
    415,
  );
});

test("expect form", async (t) => {
  const app = new Application() //
    .use(expectForm())
    .use((ctx) => {
      ctx.response.body = "ok";
      t.not(ctx.state.body, null);
    });
  const req = request.use(start(app.callback()));

  t.is(
    (
      await req //
        .POST("/")
        .type("application/octet-stream")
        .send("something")
    ).status,
    415,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("text/plain")
        .send("text")
    ).status,
    415,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("application/json")
        .send("{}")
    ).status,
    415,
  );
  t.is(
    (
      await req //
        .POST("/")
        .type("application/x-www-form-urlencoded")
        .send("a=1")
    ).status,
    200,
  );
});

test("validate json", async (t) => {
  const app = new Application();
  app.use(expectJson());
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const req = request.use(start(app.callback()));

  t.is(
    (
      await req //
        .POST("/")
        .type("application/json")
        .send("not json")
    ).status,
    400,
  );
});

test("honor body limit", async (t) => {
  const app = new Application();
  app.use(expectText("text/plain", { maxLength: 1 }));
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const req = request.use(start(app.callback()));

  t.is(
    (
      await req //
        .POST("/")
        .type("text/plain")
        .send("body")
    ).status,
    413,
  );
});

test("decompress", async (t) => {
  const app = new Application();
  app.use(expectText());
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const req = request.use(start(app.callback()));

  t.is(
    (
      await req //
        .POST("/")
        .header("content-encoding", "identity")
        .type("text/plain")
        .send("text")
    ).status,
    200,
  );
  t.is(
    (
      await req //
        .POST("/")
        .header("content-encoding", "invalid")
        .type("text/plain")
        .send("text")
    ).status,
    400,
  );
  t.is(
    (
      await req //
        .POST("/")
        .header("content-encoding", "gzip")
        .type("text/plain")
        .send("invalid")
    ).status,
    400,
  );
  t.is(
    (
      await req //
        .POST("/")
        .header("content-encoding", "deflate")
        .type("text/plain")
        .send("invalid")
    ).status,
    400,
  );
  t.is(
    (
      await req //
        .POST("/")
        .header("content-encoding", "br")
        .type("text/plain")
        .send("invalid")
    ).status,
    400,
  );
  t.is(
    (
      await req //
        .POST("/")
        .header("content-encoding", "gzip")
        .type("text/plain")
        .send(gzipSync("data"))
    ).status,
    200,
  );
  t.is(
    (
      await req //
        .POST("/")
        .header("content-encoding", "deflate")
        .type("text/plain")
        .send(gzipSync("data"))
    ).status,
    200,
  );
  t.is(
    (
      await req //
        .POST("/")
        .header("content-encoding", "br")
        .type("text/plain")
        .send(brotliCompressSync("data"))
    ).status,
    200,
  );
});
