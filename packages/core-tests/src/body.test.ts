import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";

import test from "ava";

test("null body", async (t) => {
  // Arrange.

  const app = new Application();
  app.use((ctx) => {
    ctx.response.body = null;
  });

  // Act.

  const response = await request.use(start(app.callback())).get("/").send();

  // Assert.

  t.is(response.status, 200);
  t.deepEqual([...response.headers.keys()].sort(), ["connection", "date"]);
  t.is(response.headers.get("Connection"), "close");
  t.is(await response.body.text(), "");
});

test("text body", async (t) => {
  // Arrange.

  const app = new Application();
  app.use((ctx) => {
    ctx.response.body = "ok";
  });

  // Act.

  const response = await request.use(start(app.callback())).get("/").send();

  // Assert.

  t.is(response.status, 200);
  t.deepEqual([...response.headers.keys()].sort(), [
    "connection",
    "content-length",
    "content-type",
    "date",
  ]);
  t.is(response.headers.get("Connection"), "close");
  t.is(response.headers.get("Content-Length"), "2");
  t.is(response.headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(await response.body.text(), "ok");
});
