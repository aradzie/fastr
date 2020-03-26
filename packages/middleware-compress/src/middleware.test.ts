import { Streamable } from "@fastr/body";
import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import test from "ava";
import crypto from "crypto";
import { Readable } from "stream";
import { compress } from "./middleware.js";

const content = crypto.randomBytes(1024).toString("hex");

class FakeStreamable extends Streamable {
  constructor(readonly content: string) {
    super();
  }

  override length(): number | null {
    return Buffer.byteLength(this.content);
  }

  override open(): Readable {
    const stream = new Readable();
    stream.push(this.content);
    stream.push(null);
    return stream;
  }
}

test("should compress with gzip", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text/plain";
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, br, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), content);
});

test("should compress string bodies", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text/plain";
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), content);
});

test("should compress Buffer bodies", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = Buffer.from(content);
    ctx.response.type = "text/plain";
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), content);
});

test("should compress Readable bodies", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    const stream = new Readable();
    stream.push(content);
    stream.push(null);
    ctx.response.body = stream;
    ctx.response.type = "text/plain";
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), content);
});

test("should compress Streamable bodies", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = new FakeStreamable(content);
    ctx.response.type = "text/plain";
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), null);
  t.is(await response.body.text(), content);
});

test("should compress JSON bodies", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = { value: content };
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "application/json; charset=UTF-8");
  t.is(headers.get("Content-Length"), null);
  t.deepEqual(await response.body.json(), { value: content });
});

test("should update etag", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text/plain";
    ctx.response.etag = "etag-123abc";
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), null);
  t.is(headers.get("Etag"), '"etag-123abc-gzip"');
  t.is(await response.body.text(), content);
});

test("should update weak etag", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text/plain";
    ctx.response.etag = 'W/"etag-123abc"';
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), "chunked");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), null);
  t.is(headers.get("Etag"), 'W/"etag-123abc-gzip"');
  t.is(await response.body.text(), content);
});

test("should tolerate unknown request encoding", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text/plain";
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "unknown")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "2048");
  t.is(await response.body.text(), content);
});

test("should not compress non-compressible responses", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = Buffer.from(content);
    ctx.response.type = "image/png";
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
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
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text/plain";
  });

  const response = await request
    .use(start(app.callback()))
    .HEAD("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "2048");
  t.is(await response.body.text(), "");
});

test("should not compress empty responses", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.type = "text/plain";
    ctx.response.status = 204;
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
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
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = "response";
    ctx.response.type = "text/plain";
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "8");
  t.is(await response.body.text(), "response");
});

test("should not compress when Content-Encoding is already set", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text/plain";
    ctx.response.headers.set("Content-Encoding", "identity");
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), "identity");
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "2048");
  t.is(await response.body.text(), content);
});

test("should honor ctx.state.compress = false", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = content;
    ctx.response.type = "text/plain";
    ctx.state.compress = false;
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Transfer-Encoding"), null);
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("Content-Encoding"), null);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "2048");
  t.is(await response.body.text(), content);
});

test("should honor ctx.state.compress = true", async (t) => {
  const app = new Application();
  app.use(compress());
  app.use((ctx) => {
    ctx.response.body = Buffer.from(content);
    ctx.response.type = "image/png";
    ctx.state.compress = true;
  });

  const response = await request
    .use(start(app.callback()))
    .GET("/")
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
