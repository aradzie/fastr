import test from "ava";
import Koa from "koa";
import supertest from "supertest";
import { brotliCompressSync, gzipSync } from "zlib";
import { expectBinary, expectForm, expectJson, expectText } from "./middleware";

test("expect buffer", async (t) => {
  const app = new Koa();
  app.use(expectBinary());
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const request = supertest(app.listen());

  t.is(
    (
      await request //
        .post("/")
        .type("application/octet-stream")
        .send("something")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .send("text")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("application/json")
        .send("{}")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("application/x-www-form-urlencoded")
        .send("a=1")
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
  const request = supertest(app.listen());

  t.is(
    (
      await request //
        .post("/")
        .type("application/octet-stream")
        .send("something")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .send("text")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("application/json")
        .send("{}")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("application/x-www-form-urlencoded")
        .send("a=1")
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
  const request = supertest(app.listen());

  t.is(
    (
      await request //
        .post("/")
        .type("application/octet-stream")
        .send("something")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .send("text")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("application/json")
        .send("{}")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("application/x-www-form-urlencoded")
        .send("a=1")
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
  const request = supertest(app.listen());

  t.is(
    (
      await request //
        .post("/")
        .type("application/octet-stream")
        .send("something")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .send("text")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("application/json")
        .send("{}")
    ).status,
    415,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("application/x-www-form-urlencoded")
        .send("a=1")
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
  const request = supertest(app.listen());

  t.is(
    (
      await request //
        .post("/")
        .type("application/json")
        .send("not json")
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
  const request = supertest(app.listen());

  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .send("body")
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
  const request = supertest(app.listen());

  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .set("content-encoding", "identity")
        .send("text")
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .set("content-encoding", "invalid")
        .send("text")
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .set("content-encoding", "gzip")
        .send("invalid")
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .set("content-encoding", "deflate")
        .send("invalid")
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .set("content-encoding", "br")
        .send("invalid")
    ).status,
    400,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .set("content-encoding", "gzip")
        .send(gzipSync("data"))
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .set("content-encoding", "deflate")
        .send(gzipSync("data"))
    ).status,
    200,
  );
  t.is(
    (
      await request //
        .post("/")
        .type("text/plain")
        .set("content-encoding", "br")
        .send(brotliCompressSync("data"))
    ).status,
    200,
  );
});
