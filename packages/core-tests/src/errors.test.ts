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

  const response = await request.use(server).get("/").send();

  // Assert.

  t.deepEqual(errors, []);
  t.is(response.status, 400);
  t.is(response.statusText, "Bad Request");
  t.deepEqual([...response.headers.keys()].sort(), [
    "connection",
    "content-length",
    "content-type",
    "date",
  ]);
  t.is(response.headers.get("Connection"), "close");
  t.is(response.headers.get("Content-Length"), "28");
  t.is(response.headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(await response.body.text(), "HttpError [400]: Bad Request");
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

  const response = await request.use(server).get("/").send();

  // Assert.

  t.deepEqual(errors, ["TypeError: Hidden message"]);
  t.is(response.status, 500);
  t.is(response.statusText, "Internal Server Error");
  t.deepEqual([...response.headers.keys()].sort(), [
    "connection",
    "content-length",
    "content-type",
    "date",
  ]);
  t.is(response.headers.get("Connection"), "close");
  t.is(response.headers.get("Content-Length"), "27");
  t.is(response.headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(await response.body.text(), "500 - Internal Server Error");
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

  const response = await request.use(server).get("/").send();

  // Assert.

  t.deepEqual(errors, ["TypeError"]);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.deepEqual([...response.headers.keys()].sort(), [
    "connection",
    "date",
    "transfer-encoding",
  ]);
  t.is(response.headers.get("Connection"), "close");
  t.is(response.headers.get("Transfer-Encoding"), "chunked");
  await t.throwsAsync(
    async () => {
      await response.body.text();
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

  const response = await request.use(server).get("/").send();

  // Assert.

  t.deepEqual(errors, ["TypeError"]);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.deepEqual([...response.headers.keys()].sort(), [
    "connection",
    "content-length",
    "date",
  ]);
  t.is(response.headers.get("Connection"), "close");
  t.is(response.headers.get("Content-Length"), "1000");
  await t.throwsAsync(
    async () => {
      await response.body.text();
    },
    {
      code: "ECONNRESET",
      message: "aborted",
    },
  );
});
