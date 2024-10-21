import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import test, { registerCompletionHandler } from "ava";

registerCompletionHandler(() => {
  process.exit();
});

test("GET null body", async (t) => {
  // Arrange.

  const app = new Application();
  app.use((ctx) => {
    ctx.response.body = null;
  });

  // Act.

  const res = await request.use(start(app.callback())).GET("/").send();

  // Assert.

  t.like(res, {
    status: 204,
    statusText: "No Content",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": undefined,
    "content-type": undefined,
  });
  t.is(await res.body.text(), "");
});

test("HEAD null body", async (t) => {
  // Arrange.

  const app = new Application();
  app.use((ctx) => {
    ctx.response.body = null;
  });

  // Act.

  const res = await request.use(start(app.callback())).HEAD("/").send();

  // Assert.

  t.like(res, {
    status: 204,
    statusText: "No Content",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": undefined,
    "content-type": undefined,
  });
  t.is(await res.body.text(), "");
});

test("GET text body", async (t) => {
  // Arrange.

  const app = new Application();
  app.use((ctx) => {
    ctx.response.body = "body";
  });

  // Act.

  const res = await request.use(start(app.callback())).GET("/").send();

  // Assert.

  t.like(res, {
    status: 200,
    statusText: "OK",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": "4",
    "content-type": "text/plain; charset=UTF-8",
  });
  t.is(await res.body.text(), "body");
});

test("HEAD text body", async (t) => {
  // Arrange.

  const app = new Application();
  app.use((ctx) => {
    ctx.response.body = "body";
  });

  // Act.

  const res = await request.use(start(app.callback())).HEAD("/").send();

  // Assert.

  t.like(res, {
    status: 200,
    statusText: "OK",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": "4",
    "content-type": "text/plain; charset=UTF-8",
  });
  t.is(await res.body.text(), "");
});

test("GET text body, not modified", async (t) => {
  // Arrange.

  const app = new Application();
  app.use((ctx) => {
    ctx.response.status = 304;
    ctx.response.body = "body";
    ctx.response.etag = "abc";
  });

  // Act.

  const res = await request
    .use(start(app.callback()))
    .GET("/")
    .header("etag", "abc")
    .send();

  // Assert.

  t.like(res, {
    status: 304,
    statusText: "Not Modified",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": "4",
    "content-type": "text/plain; charset=UTF-8",
    "etag": '"abc"',
  });
  t.is(await res.body.text(), "");
});

test("HEAD text body, not modified", async (t) => {
  // Arrange.

  const app = new Application();
  app.use((ctx) => {
    ctx.response.status = 304;
    ctx.response.body = "body";
    ctx.response.etag = "abc";
  });

  // Act.

  const res = await request
    .use(start(app.callback()))
    .HEAD("/")
    .header("etag", "abc")
    .send();

  // Assert.

  t.like(res, {
    status: 304,
    statusText: "Not Modified",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": "4",
    "content-type": "text/plain; charset=UTF-8",
    "etag": '"abc"',
  });
  t.is(await res.body.text(), "");
});
