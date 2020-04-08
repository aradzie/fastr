import { request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import test from "ava";
import Koa from "koa";
import { brotliCompressSync, gzipSync } from "zlib";
import { expectBinary, expectForm, expectJson, expectText } from "./middleware";

test("expect buffer", async (t) => {
  const app = new Koa();
  app.use(expectBinary());
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const srv = start(app.callback());

  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("something", "application/octet-stream")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("text", "text/plain")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("{}", "application/json")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("a=1", "application/x-www-form-urlencoded")
    ).status,
    415,
  );
});

test("expect text", async (t) => {
  const app = new Koa();
  app.use(expectText());
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const srv = start(app.callback());

  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("something", "application/octet-stream")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("text", "text/plain")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("{}", "application/json")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("a=1", "application/x-www-form-urlencoded")
    ).status,
    415,
  );
});

test("expect json", async (t) => {
  const app = new Koa();
  app.use(expectJson());
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const srv = start(app.callback());

  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("something", "application/octet-stream")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("text", "text/plain")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("{}", "application/json")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("a=1", "application/x-www-form-urlencoded")
    ).status,
    415,
  );
});

test("expect form", async (t) => {
  const app = new Koa();
  app.use(expectForm());
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const srv = start(app.callback());

  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("something", "application/octet-stream")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("text", "text/plain")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("{}", "application/json")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("a=1", "application/x-www-form-urlencoded")
    ).status,
    200,
  );
});

test("validate json", async (t) => {
  const app = new Koa();
  app.use(expectJson());
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const srv = start(app.callback());

  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("not json", "application/json")
    ).status,
    400,
  );
});

test("honor body limit", async (t) => {
  const app = new Koa();
  app.use(expectText("text/plain", { lengthLimit: 1 }));
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const srv = start(app.callback());

  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .send("body", "text/plain")
    ).status,
    413,
  );
});

test("decompress", async (t) => {
  const app = new Koa();
  app.use(expectText());
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const srv = start(app.callback());

  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .header("content-encoding", "identity")
        .send("text", "text/plain")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .header("content-encoding", "invalid")
        .send("text", "text/plain")
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .header("content-encoding", "gzip")
        .send("invalid", "text/plain")
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .header("content-encoding", "deflate")
        .send("invalid", "text/plain")
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .header("content-encoding", "br")
        .send("invalid", "text/plain")
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .header("content-encoding", "gzip")
        .send(gzipSync("data"), "text/plain")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .header("content-encoding", "deflate")
        .send(gzipSync("data"), "text/plain")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .use(srv)
        .header("content-encoding", "br")
        .send(brotliCompressSync("data"), "text/plain")
    ).status,
    200,
  );
});
