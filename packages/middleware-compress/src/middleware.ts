import { type Context, type Middleware, type Next } from "@fastr/core";
import { ETag } from "@fastr/headers";
import { Stream, type Transform } from "stream";
import { createGzip } from "zlib";
import { compressible } from "./compressible.js";

export interface CompressOptions {
  readonly threshold?: number;
  readonly filter?: (type: string) => boolean;
}

export function compress({
  threshold = 1024,
  filter = compressible,
}: CompressOptions = {}): Middleware {
  return async (ctx: Context, next: Next): Promise<void> => {
    ctx.response.headers.append("Vary", "Content-Encoding");

    await next();

    if (
      ctx.state.compress === false ||
      ctx.request.method === "HEAD" ||
      ctx.response.status === 204 ||
      ctx.response.status === 205 ||
      ctx.response.status === 304 ||
      ctx.response.headers.has("Content-Encoding")
    ) {
      return;
    }

    if (
      ctx.state.compress === true ||
      filter(
        ctx.response.headers.get("Content-Type") ?? "application/octet-stream",
      )
    ) {
      if (ctx.request.acceptsEncoding("gzip")) {
        transform(ctx, "gzip", createGzip());
      }
    }
  };

  function transform(
    ctx: Context,
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

  function replace(ctx: Context, encoding: string, transform: Transform): void {
    ctx.response.headers.delete("Content-Length");
    ctx.response.headers.set("Content-Encoding", encoding);
    const etag = ctx.response.headers.map("ETag", ETag.parse);
    if (etag != null) {
      etag.value = `${etag.value}-${encoding}`;
      ctx.response.etag = etag;
    }
    ctx.response.body = transform;
  }
}

function toBuffer(body: unknown): Buffer {
  if (typeof body === "string") {
    return Buffer.from(body);
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  return Buffer.from(JSON.stringify(body));
}
