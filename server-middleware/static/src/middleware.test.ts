import { mkdir, removeDir, writeFile } from "@aradzie/fsx";
import test from "ava";
import Koa from "koa";
import { join } from "path";
import supertest from "supertest";
import zlib from "zlib";
import { preciseTagger } from "./etag";
import { staticFiles } from "./middleware";

const dir = "/tmp/static-files-middleware/";

const content = "data\n".repeat(1000);

test.before(async (t) => {
  await removeDir(dir);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "file.txt"), content);
  await writeFile(join(dir, "file.txt.gz"), compress("gzip", "gz." + content));
  await writeFile(join(dir, "file.txt.br"), compress("br", "br." + content));
});

test.after(async (t) => {
  await removeDir(dir);
});

test("unknown file", async (t) => {
  const app = new Koa();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => (ctx.response.body = "ok"));

  const response = await supertest(app.listen()).get("/unknown.txt");

  t.is(response.status, 200);
  t.is(response.text, "ok");
});

test("select brotli variant", async (t) => {
  const app = new Koa();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => (ctx.response.body = "ok"));

  const response = await supertest(app.listen())
    .get("/file.txt")
    .set("Accept-Encoding", "br, identity");

  t.is(response.status, 200);
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), "27");
  t.is(response.get("Content-Encoding"), "br");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("ETag"), '"3c23d24ca83efb39718f-br"');
  // TODO t.is(response.text, "br." + styleData);
});

test("select gzip variant", async (t) => {
  const app = new Koa();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => (ctx.response.body = "ok"));

  const response = await supertest(app.listen())
    .get("/file.txt")
    .set("Accept-Encoding", "gzip, identity");

  t.is(response.status, 200);
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), "54");
  t.is(response.get("Content-Encoding"), "gzip");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("ETag"), '"224ec329618d0ef9acdf-gzip"');
  t.is(response.text, "gz." + content);
});

test("select identity variant", async (t) => {
  const app = new Koa();
  app.use(staticFiles(dir, { tagger: preciseTagger }));

  const response = await supertest(app.listen())
    .get("/file.txt")
    .set("Accept-Encoding", "identity");

  t.is(response.status, 200);
  t.is(response.get("Content-Type"), "text/plain; charset=utf-8");
  t.is(response.get("Content-Length"), "5000");
  t.is(response.get("Content-Encoding"), "identity");
  t.is(response.get("Vary"), "Content-Encoding");
  t.is(response.get("ETag"), '"97da7fce962eee2e9f73"');
  t.is(response.text, content);
});

test("cache control", async (t) => {
  const app = new Koa();
  app.use(
    staticFiles(dir, {
      cacheControl: {
        maxAge: 3600,
        immutable: true,
      },
    }),
  );

  const response = await supertest(app.listen())
    .get("/file.txt")
    .set("Accept-Encoding", "identity");

  t.is(response.status, 200);
  t.is(response.get("Cache-Control"), "public, max-age=3600, immutable");
});

function compress(method: "gzip" | "br", input: string | Buffer): Buffer {
  if (typeof input === "string") {
    input = Buffer.from(input);
  }
  switch (method) {
    case "gzip":
      return zlib.gzipSync(input);
    case "br":
      return zlib.brotliCompressSync(input);
  }
}
