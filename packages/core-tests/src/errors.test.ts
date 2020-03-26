import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import { BadRequestError } from "@fastr/errors";
import test from "ava";

test("handle client errors", async (t) => {
  // Arrange.

  const errors: string[] = [];
  const app = new Application();
  app.on("error", (err) => {
    errors.push(String(err));
  });
  app.use((ctx) => {
    ctx.response.body = "ok";
    throw new BadRequestError();
  });
  const server = start(app.callback());

  // Act.

  const res = await request.use(server).GET("/").send();

  // Assert.

  t.deepEqual(errors, []);
  t.like(res, {
    status: 400,
    statusText: "Bad Request",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": "28",
    "content-type": "text/plain; charset=UTF-8",
  });
  t.is(await res.body.text(), "HttpError [400]: Bad Request");
});

test("handle server errors", async (t) => {
  // Arrange.

  const errors: string[] = [];
  const app = new Application();
  app.on("error", (err) => {
    errors.push(String(err));
  });
  app.use((ctx) => {
    ctx.response.body = "ok";
    throw new TypeError("Hidden message");
  });
  const server = start(app.callback());

  // Act.

  const res = await request.use(server).GET("/").send();

  // Assert.

  t.deepEqual(errors, ["TypeError: Hidden message"]);
  t.like(res, {
    status: 500,
    statusText: "Internal Server Error",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": "27",
    "content-type": "text/plain; charset=UTF-8",
  });
  t.is(await res.body.text(), "500 - Internal Server Error");
});

test("abort message without content length", async (t) => {
  // Arrange.

  const errors: string[] = [];
  const app = new Application();
  app.on("error", (err) => {
    errors.push(String(err));
  });
  app.use((ctx) => {
    ctx.response.res.flushHeaders();
    ctx.response.res.write("response body");
    throw new TypeError();
  });
  const server = start(app.callback());

  // Act.

  const res = await request.use(server).GET("/").send();

  // Assert.

  t.deepEqual(errors, ["TypeError"]);
  t.like(res, {
    status: 200,
    statusText: "OK",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": undefined,
    "content-type": undefined,
    "transfer-encoding": "chunked",
  });
  await t.throwsAsync(
    async () => {
      await res.body.text();
    },
    {
      code: "ECONNRESET",
      message: "aborted",
    },
  );
});

test("abort message with content length", async (t) => {
  // Arrange.

  const errors: string[] = [];
  const app = new Application();
  app.on("error", (err) => {
    errors.push(String(err));
  });
  app.use((ctx) => {
    ctx.response.res.setHeader("content-length", "1000");
    ctx.response.res.flushHeaders();
    ctx.response.res.write("response body");
    throw new TypeError();
  });
  const server = start(app.callback());

  // Act.

  const res = await request.use(server).GET("/").send();

  // Assert.

  t.deepEqual(errors, ["TypeError"]);
  t.like(res, {
    status: 200,
    statusText: "OK",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": "1000",
    "content-type": undefined,
    "transfer-encoding": undefined,
  });
  await t.throwsAsync(
    async () => {
      await res.body.text();
    },
    {
      code: "ECONNRESET",
      message: "aborted",
    },
  );
});
