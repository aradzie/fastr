import {
  type BodyInit,
  type Encoding,
  GzipEncoding,
  Payload,
  pipe,
  Streamable,
} from "@fastr/body";
import { type Context, type Middleware, type Next } from "@fastr/core";
import { ETag } from "@fastr/headers";
import { MediaTypes } from "@fastr/mediatypes";
import { Readable } from "stream";

export interface CompressOptions {
  readonly threshold?: number;
  readonly filter?: (type: string) => boolean;
  readonly encodings?: readonly Encoding[];
}

export const compressible = (type: string): boolean => {
  return MediaTypes.lookup(type)?.compressible === true;
};

export const compress = ({
  threshold = 1024,
  filter = compressible,
  encodings = [new GzipEncoding()],
}: CompressOptions = {}): Middleware => {
  const acceptedEncoding = (ctx: Context): Encoding | null => {
    const id = ctx.request.negotiateEncoding(...encodings.map(({ id }) => id));
    for (const encoding of encodings) {
      if (encoding.id === id) {
        return encoding;
      }
    }
    return null;
  };

  const exclude = (ctx: Context): boolean => {
    return (
      ctx.state.compress === false ||
      ctx.request.method === "HEAD" ||
      ctx.response.status === 204 ||
      ctx.response.status === 205 ||
      ctx.response.status === 304 ||
      ctx.response.headers.has("Content-Encoding")
    );
  };

  const include = (ctx: Context, type: string): boolean => {
    return ctx.state.compress === true || filter(type);
  };

  const replaceBody = (
    ctx: Context,
    encoding: Encoding,
    body: Readable,
    type: string,
  ): void => {
    ctx.response.headers.delete("Content-Length");
    ctx.response.headers.set("Content-Type", type);
    ctx.response.headers.set("Content-Encoding", encoding.id);
    const etag = ETag.get(ctx.response.headers);
    if (etag != null) {
      etag.value = `${etag.value}-${encoding.id}`;
      ctx.response.etag = etag;
    }
    ctx.response.body = body;
  };

  const encodeBody = (
    ctx: Context,
    encoding: Encoding,
    body: BodyInit,
    type: string,
  ): void => {
    if (typeof body === "string") {
      if (Buffer.byteLength(body) >= threshold) {
        replaceBody(ctx, encoding, encoding.encoder().end(body), type);
      }
    } else if (Buffer.isBuffer(body)) {
      if (body.byteLength >= threshold) {
        replaceBody(ctx, encoding, encoding.encoder().end(body), type);
      }
    } else if (body instanceof Readable) {
      const transform = encoding.encoder();
      pipe(body, transform);
      replaceBody(ctx, encoding, transform, type);
    } else if (body instanceof Streamable) {
      const length = body.length();
      if (length == null || length >= threshold) {
        const transform = encoding.encoder();
        pipe(body.open(), transform);
        replaceBody(ctx, encoding, transform, type);
      }
    } else {
      throw new TypeError(
        `Invalid body type ${Object.prototype.toString.call(body)}`,
      );
    }
  };

  return async (ctx: Context, next: Next): Promise<void> => {
    ctx.response.headers.append("Vary", "Content-Encoding");

    await next();

    const encoding = acceptedEncoding(ctx);
    if (encoding != null) {
      const payload = new Payload(ctx.response.body, ctx.response.headers);
      const { body, type } = payload;
      if (body != null && type != null && !exclude(ctx) && include(ctx, type)) {
        encodeBody(ctx, encoding, body, type);
      }
    }
  };
};
