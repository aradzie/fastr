import compressible from "compressible";
import type Koa from "koa";
import { Stream, Transform } from "stream";
import { createGzip } from "zlib";

export interface Options {
  threshold?: number;
  filter?: (type: string) => boolean | undefined;
}

export function compress({
  threshold = 1024,
  filter = compressible,
}: Options = {}): Koa.Middleware {
  const compress = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
    ctx.response.vary("Content-Encoding");

    await next();

    if (
      ctx.compress === false ||
      ctx.request.method === "HEAD" ||
      ctx.response.status === 204 ||
      ctx.response.status === 205 ||
      ctx.response.status === 304 ||
      ctx.response.get("Content-Encoding")
    ) {
      return;
    }

    if (!(ctx.compress === true || filter(ctx.response.type))) {
      return;
    }

    if (ctx.request.acceptsEncodings("gzip", "identity") === "gzip") {
      transform(ctx, "gzip", createGzip());
    }
  };
  Object.defineProperty(compress, "name", {
    value: "compress",
  });
  return compress;

  function transform(
    ctx: Koa.Context,
    encoding: string,
    transform: Transform,
  ): void {
    const { body } = ctx.response;
    if (body instanceof Stream) {
      replace(ctx, encoding, body.pipe(transform));
      return;
    }
    const buffer = (ctx.response.body = toBuffer(body));
    if (buffer.byteLength >= threshold) {
      transform.end(buffer);
      replace(ctx, encoding, transform);
      return;
    }
  }

  function replace(
    ctx: Koa.Context,
    encoding: string,
    transform: Transform,
  ): void {
    ctx.response.set("Content-Encoding", encoding);
    ctx.response.remove("Content-Length");
    const { etag } = ctx.response;
    if (etag) {
      ctx.response.etag = updateEtag(ctx, etag, encoding);
    }
    ctx.response.body = transform;
  }

  function updateEtag(
    ctx: Koa.Context,
    etag: string,
    encoding: string,
  ): string {
    if (etag.startsWith('W/"') && etag.endsWith('"')) {
      etag = etag.substring(3, etag.length - 1);
      return `W/"${etag}-${encoding}"`;
    }
    if (etag.startsWith('"') && etag.endsWith('"')) {
      etag = etag.substring(1, etag.length - 1);
      return `"${etag}-${encoding}"`;
    }
    return etag;
  }
}

function toBuffer(body: any): Buffer {
  if (typeof body === "string") {
    return Buffer.from(body);
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  return Buffer.from(JSON.stringify(body));
}
