import { request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import test from "ava";
import crypto from "crypto";
import Koa from "koa";
import { Readable } from "stream";
import { compress } from "./index.js";

const content = crypto.randomBytes(1024).toString("hex");

test("should compress with gzip", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text";
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, br, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), content);
});

test("should compress strings", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text";
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), content);
});

test("should compress buffers", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = Buffer.from(content);
    ctx.response.type = "text";
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), content);
});

test("should compress streams", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    const stream = new Readable();
    stream.push(content);
    stream.push(null);
    ctx.response.body = stream;
    ctx.response.type = "text";
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), content);
});

test("should compress JSON", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = { value: content };
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "application/json; charset=utf-8");
  t.is(headers.get("Content-Length"), null);
  t.deepEqual(await response.body.json(), { value: content });
});

test("should update etag", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text";
    ctx.response.etag = "etag-123abc";
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), null);
  t.is(headers.get("Etag"), '"etag-123abc-gzip"');
  t.is(await response.body.text(), content);
});

test("should update weak etag", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text";
    ctx.response.etag = 'W/"etag-123abc"';
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), null);
  t.is(headers.get("Etag"), 'W/"etag-123abc-gzip"');
  t.is(await response.body.text(), content);
});

test("should tolerate unknown request encoding", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text";
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "unknown")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), "2048");
  t.is(await response.body.text(), content);
});

test("should not compress non-compressible responses", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = Buffer.from(content);
    ctx.response.type = "image/png";
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), "image/png");
  t.is(headers.get("Content-Length"), "2048");
});

test("should not compress HEAD requests", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text";
  });

  const response = await request
    .use(start(app.callback()))
    .head("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), "2048");
  t.is(await response.body.text(), "");
});

test("should not compress empty responses", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.type = "text";
    ctx.response.status = 204;
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 204);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), null);
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), "");
});

test("should not compress below size threshold", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = "response";
    ctx.response.type = "text";
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), "8");
  t.is(await response.body.text(), "response");
});

test("should not compress when Content-Encoding is already set", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text";
    ctx.response.set("Content-Encoding", "identity");
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "identity");
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), "2048");
  t.is(await response.body.text(), content);
});

test("should honor ctx.compress = false", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text";
    ctx.compress = false;
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), "2048");
  t.is(await response.body.text(), content);
});

test("should honor ctx.compress = true", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = Buffer.from(content);
    ctx.response.type = "image/png";
    ctx.compress = true;
  });

  const response = await request
    .use(start(app.callback()))
    .get("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "image/png");
  t.is(headers.get("Content-Length"), null);
});
