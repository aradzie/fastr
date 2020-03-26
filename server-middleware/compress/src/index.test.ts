import test from "ava";
import crypto from "crypto";
import Koa from "koa";
import { Readable } from "stream";
import supertest from "supertest";
import { compress } from "./index";

const string = crypto.randomBytes(1024).toString("hex");

test("should compress with gzip", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = string;
    ctx.response.type = "text";
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, br, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), "chunked");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), "gzip");
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), undefined);
  t.is(response.text, string);
});

test("should compress strings", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = string;
    ctx.response.type = "text";
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), "chunked");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), "gzip");
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), undefined);
  t.is(response.text, string);
});

test("should compress buffers", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = Buffer.from(string);
    ctx.response.type = "text";
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), "chunked");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), "gzip");
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), undefined);
  t.is(response.text, string);
});

test("should compress streams", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    const stream = new Readable();
    stream.push(string);
    stream.push(null);
    ctx.response.body = stream;
    ctx.response.type = "text";
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), "chunked");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), "gzip");
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), undefined);
  t.is(response.text, string);
});

test("should compress JSON", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = { value: string };
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), "chunked");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), "gzip");
  t.is(response.get("Content-Type"), "application/json; charset=utf-8");
  t.is(response.get("Content-Length"), undefined);
  t.deepEqual(response.body, { value: string });
});

test("should update etag", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = string;
    ctx.response.type = "text";
    ctx.response.etag = "etag-123abc";
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), "chunked");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), "gzip");
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), undefined);
  t.is(response.get("Etag"), '"etag-123abc-gzip"');
  t.is(response.text, string);
});

test("should update weak etag", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = string;
    ctx.response.type = "text";
    ctx.response.etag = 'W/"etag-123abc"';
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), "chunked");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), "gzip");
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), undefined);
  t.is(response.get("Etag"), 'W/"etag-123abc-gzip"');
  t.is(response.text, string);
});

test("should tolerate unknown request encoding", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = string;
    ctx.response.type = "text";
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "unknown");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), undefined);
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), undefined);
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), "2048");
  t.is(response.text, string);
});

test("should not compress non-compressible responses", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = Buffer.from(string);
    ctx.response.type = "image/png";
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), undefined);
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), undefined);
  t.is(response.get("Content-Type"), "image/png");
  t.is(response.get("Content-Length"), "2048");
});

test("should not compress HEAD requests", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = string;
    ctx.response.type = "text";
  });

  const response = await supertest(app.listen())
    .head("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), undefined);
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), undefined);
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), "2048");
  t.is(response.text, undefined);
});

test("should not compress empty responses", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.type = "text";
    ctx.response.status = 204;
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 204);
  t.is(response.get("Transfer-Encoding"), undefined);
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), undefined);
  t.is(response.get("Content-Type"), undefined);
  t.is(response.get("Content-Length"), undefined);
  t.is(response.text, "");
});

test("should not compress below threshold", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = "response";
    ctx.response.type = "text";
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), undefined);
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), undefined);
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), "8");
  t.is(response.text, "response");
});

test("should not compress when Content-Encoding is already set", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = string;
    ctx.response.type = "text";
    ctx.response.set("Content-Encoding", "identity");
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), undefined);
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), "identity");
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), "2048");
  t.is(response.text, string);
});

test("should honor ctx.compress = false", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = string;
    ctx.response.type = "text";
    ctx.compress = false;
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), undefined);
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), undefined);
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), "2048");
  t.is(response.text, string);
});

test("should honor ctx.compress = true", async (t) => {
  const app = new Koa();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = Buffer.from(string);
    ctx.response.type = "image/png";
    ctx.compress = true;
  });

  const response = await supertest(app.listen())
    .get("/")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Transfer-Encoding"), "chunked");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("Content-Encoding"), "gzip");
  t.is(response.get("Content-Type"), "image/png");
  t.is(response.get("Content-Length"), undefined);
});
