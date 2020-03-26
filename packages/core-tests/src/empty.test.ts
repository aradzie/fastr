import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import test from "ava";

test("GET no middleware", async (t) => {
  // Arrange.

  const app = new Application();
  app
    .use((ctx, next) => next())
    .use((ctx, next) => next())
    .use((ctx, next) => next());

  // Act.

  const res = await request.use(start(app.callback())).GET("/").send();

  // Assert.

  t.like(res, {
    status: 404,
    statusText: "Not Found",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": "9",
    "content-type": "text/plain; charset=UTF-8",
  });
  t.is(await res.body.text(), "Not found");
});

test("HEAD no middleware", async (t) => {
  // Arrange.

  const app = new Application();
  app
    .use((ctx, next) => next())
    .use((ctx, next) => next())
    .use((ctx, next) => next());

  // Act.

  const res = await request.use(start(app.callback())).HEAD("/").send();

  // Assert.

  t.like(res, {
    status: 404,
    statusText: "Not Found",
  });
  t.like(res.headers.toJSON(), {
    "connection": "close",
    "content-length": "9",
    "content-type": "text/plain; charset=UTF-8",
  });
  t.is(await res.body.text(), "");
});
