import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import test from "ava";
import { conditional } from "./index.js";

test("cache if etags strongly match", async (t) => {
  // Arrange.

  const app = new Application();
  app.use(conditional());
  app.use((ctx) => {
    ctx.response.status = 200;
    ctx.response.body = "body";
    ctx.response.etag = "ETAG";
  });

  // Act.

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("If-None-Match", 'W/"FOO", W/"BAR", "ETAG"')
    .send();

  // Assert.

  const { status, headers } = response;
  t.is(status, 304);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "4");
  t.is(await response.body.text(), "");
});

test("cache if etags weakly match", async (t) => {
  // Arrange.

  const app = new Application();
  app.use(conditional());
  app.use((ctx) => {
    ctx.response.status = 200;
    ctx.response.body = "body";
    ctx.response.etag = 'W/"ETAG"';
  });

  // Act.

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("If-None-Match", 'W/"FOO", W/"BAR", W/"ETAG"')
    .send();

  // Assert.

  const { status, headers } = response;
  t.is(status, 304);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "4");
  t.is(await response.body.text(), "");
});

test("do not cache if etags are different", async (t) => {
  // Arrange.

  const app = new Application();
  app.use(conditional());
  app.use((ctx) => {
    ctx.response.status = 200;
    ctx.response.body = "body";
    ctx.response.etag = '"ETAG"';
  });

  // Act.

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("If-None-Match", 'W/"FOO", W/"BAR", "BAZ"')
    .send();

  // Assert.

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "4");
  t.is(await response.body.text(), "body");
});

test("do not cache if response has no ETag", async (t) => {
  // Arrange.

  const app = new Application();
  app.use(conditional());
  app.use((ctx) => {
    ctx.response.status = 200;
    ctx.response.body = "body";
  });

  // Act.

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("If-None-Match", '"ETAG"')
    .send();

  // Assert.

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "4");
  t.is(await response.body.text(), "body");
});

test("do not cache if request has no If-None-Match", async (t) => {
  // Arrange.

  const app = new Application();
  app.use(conditional());
  app.use((ctx) => {
    ctx.response.status = 200;
    ctx.response.body = "body";
    ctx.response.etag = '"ETAG"';
  });

  // Act.

  const response = await request.use(start(app.callback())).get("/").send();

  // Assert.

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "4");
  t.is(await response.body.text(), "body");
});

test("do not cache if request If-None-Match is *", async (t) => {
  // Arrange.

  const app = new Application();
  app.use(conditional());
  app.use((ctx) => {
    ctx.response.status = 200;
    ctx.response.body = "body";
    ctx.response.etag = '"ETAG"';
  });

  // Act.

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("If-None-Match", "*")
    .send();

  // Assert.

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "4");
  t.is(await response.body.text(), "body");
});

test("do not cache if request is not GET or HEAD", async (t) => {
  // Arrange.

  const etag = '"ETAG"';

  const app = new Application();
  app.use(conditional());
  app.use((ctx) => {
    ctx.response.status = 200;
    ctx.response.body = "body";
    ctx.response.etag = etag;
  });

  // Act.

  const response = await request
    .use(start(app.callback()))
    .post("/")
    .header("If-None-Match", etag)
    .send();

  // Assert.

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "4");
  t.is(await response.body.text(), "body");
});

test("do not cache if response status is not success", async (t) => {
  // Arrange.

  const etag = '"ETAG"';

  const app = new Application();
  app.use(conditional());
  app.use((ctx) => {
    ctx.response.status = 400;
    ctx.response.body = "body";
    ctx.response.etag = etag;
  });

  // Act.

  const response = await request
    .use(start(app.callback()))
    .post("/")
    .header("If-None-Match", etag)
    .send();

  // Assert.

  const { status, headers } = response;
  t.is(status, 400);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "4");
  t.is(await response.body.text(), "body");
});

test("do not cache if request has Cache-Control no-cache", async (t) => {
  // Arrange.

  const etag = '"ETAG"';

  const app = new Application();
  app.use(conditional());

  app.use((ctx) => {
    ctx.response.status = 200;
    ctx.response.body = "body";
    ctx.response.etag = etag;
  });

  // Act.

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("If-None-Match", etag)
    .header("Cache-Control", "no-cache")
    .send();

  // Assert.

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "4");
  t.is(await response.body.text(), "body");
});
