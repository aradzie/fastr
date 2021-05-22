import { mkdir, removeDir, writeFile } from "@aradzie/fsx";
import { CacheControl } from "@webfx-http/headers";
import { request } from "@webfx-request/node";
import { start } from "@webfx-request/testlib";
import test from "ava";
import Koa from "koa";
import { join } from "path";
import { brotliCompressSync, gzipSync } from "zlib";
import { preciseTagger } from "./etag.js";
import { staticFiles } from "./middleware.js";

const dir = "/tmp/static-files-middleware/";

const content = "data\n".repeat(1000);

test.before(async () => {
  await removeDir(dir);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "file.txt"), content);
  await writeFile(join(dir, "file.txt.gz"), compress("gzip", "gz." + content));
  await writeFile(join(dir, "file.txt.br"), compress("br", "br." + content));
});

test.after(async () => {
  await removeDir(dir);
});

test("unknown file", async (t) => {
  const app = new Koa();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => (ctx.response.body = "ok"));
  const srv = start(app.listen());

  const response = await request.use(srv).get("/unknown.txt").send();

  t.is(response.status, 200);
  t.is(await response.body.text(), "ok");
});

test("select identity variant", async (t) => {
  const app = new Koa();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  const srv = start(app.listen());

  const response = await request
    .use(srv)
    .get("/file.txt")
    .header("Accept-Encoding", "identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), "5000");
  t.is(headers.get("Content-Encoding"), "identity");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("ETag"), '"97da7fce962eee2e9f73"');
  t.is(await response.body.text(), content);
});

test("select gzip variant", async (t) => {
  const app = new Koa();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => (ctx.response.body = "ok"));
  const srv = start(app.listen());

  const response = await request
    .use(srv)
    .get("/file.txt")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), "54");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("ETag"), '"224ec329618d0ef9acdf-gzip"');
  t.is(await response.body.text(), "gz." + content);
});

test("select brotli variant", async (t) => {
  const app = new Koa();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => (ctx.response.body = "ok"));
  const srv = start(app.listen());

  const response = await request
    .use(srv)
    .get("/file.txt")
    .header("Accept-Encoding", "br, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(headers.get("Content-Length"), "27");
  t.is(headers.get("Content-Encoding"), "br");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("ETag"), '"3c23d24ca83efb39718f-br"');
  t.is(await response.body.text(), "br." + content);
});

test("cache control", async (t) => {
  const app = new Koa();
  app.use(
    staticFiles(dir, {
      cacheControl: new CacheControl({
        isPublic: true,
        noTransform: true,
        immutable: true,
        maxAge: 3600,
      }),
    }),
  );
  const srv = start(app.listen());

  const response = await request
    .use(srv)
    .get("/file.txt")
    .header("Accept-Encoding", "identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(
    headers.get("Cache-Control"),
    "public, no-transform, immutable, max-age=3600",
  );
});

function compress(method: "gzip" | "br", input: string | Buffer): Buffer {
  if (typeof input === "string") {
    input = Buffer.from(input);
  }
  switch (method) {
    case "gzip":
      return gzipSync(input);
    case "br":
      return brotliCompressSync(input);
  }
}
