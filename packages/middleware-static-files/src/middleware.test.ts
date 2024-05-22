import { join } from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";
import { request } from "@fastr/client";
import { start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import { CacheControl } from "@fastr/headers";
import { mkdir, removeDir, writeFile } from "@sosimple/fsx";
import test from "ava";
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

test("invalid path", async (t) => {
  const app = new Application();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const server = start(app.callback());

  const response = await request.use(server).GET("/%XX").send();

  t.is(response.status, 400);
  t.is(await response.body.text(), 'HttpError [400]: Invalid path "/%XX"');
});

test("unknown file", async (t) => {
  const app = new Application();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const server = start(app.callback());

  const response = await request.use(server).GET("/unknown.txt").send();

  t.is(response.status, 200);
  t.is(await response.body.text(), "ok");
});

test("select identity variant", async (t) => {
  const app = new Application();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  const server = start(app.callback());

  const response = await request
    .use(server)
    .GET("/file.txt")
    .header("Accept-Encoding", "identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "5000");
  t.is(headers.get("Content-Encoding"), "identity");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("ETag"), '"97da7fce962eee2e9f73"');
  t.is(await response.body.text(), content);
});

test("select gzip variant", async (t) => {
  const app = new Application();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const server = start(app.callback());

  const response = await request
    .use(server)
    .GET("/file.txt")
    .header("Accept-Encoding", "gzip, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "54");
  t.is(headers.get("Content-Encoding"), "gzip");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("ETag"), '"224ec329618d0ef9acdf-gzip"');
  t.is(await response.body.text(), "gz." + content);
});

test("select brotli variant", async (t) => {
  const app = new Application();
  app.use(staticFiles(dir, { tagger: preciseTagger }));
  app.use((ctx) => {
    ctx.response.body = "ok";
  });
  const server = start(app.callback());

  const response = await request
    .use(server)
    .GET("/file.txt")
    .header("Accept-Encoding", "br, identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(headers.get("Content-Type"), "text/plain; charset=UTF-8");
  t.is(headers.get("Content-Length"), "27");
  t.is(headers.get("Content-Encoding"), "br");
  t.is(headers.get("Vary"), "Content-Encoding");
  t.is(headers.get("ETag"), '"3c23d24ca83efb39718f-br"');
  t.is(await response.body.text(), "br." + content);
});

test("cache control", async (t) => {
  const app = new Application();
  app.use(
    staticFiles(dir, {
      cacheControl: new CacheControl({
        isPublic: true,
        noTransform: true,
        maxAge: 3600,
        ext: [["immutable", null]],
      }),
    }),
  );
  const server = start(app.callback());

  const response = await request
    .use(server)
    .GET("/file.txt")
    .header("Accept-Encoding", "identity")
    .send();

  const { status, headers } = response;
  t.is(status, 200);
  t.is(
    headers.get("Cache-Control"),
    "public, no-transform, max-age=3600, immutable",
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
