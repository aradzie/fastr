import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import test from "ava";

test("no middleware", async (t) => {
  // Arrange.

  const app = new Application();

  // Act.

  const response = await request.use(start(app.callback())).get("/").send();

  // Assert.

  t.is(response.status, 404);
  t.is(response.headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(await response.body.text(), "Not found");
});

test("empty middleware", async (t) => {
  // Arrange.

  const app = new Application();

  app
    .use((ctx, next) => next())
    .use((ctx, next) => next())
    .use((ctx, next) => next());

  // Act.

  const response = await request.use(start(app.callback())).get("/").send();

  // Assert.

  t.is(response.status, 404);
  t.is(response.headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(await response.body.text(), "Not found");
});
