import { createReadStream } from "@aradzie/fsx";
import Koa from "koa";
import { join, normalize, resolve } from "path";
import { Encoding } from "./encoding";
import { fastTagger, Tagger } from "./etag";
import { normalizeUriPath } from "./path";
import { findVariant } from "./variant";

export interface CacheControl {
  readonly maxAge?: number;
  readonly immutable?: boolean;
}

export interface Options {
  readonly tagger?: Tagger;
  readonly include?: RegExp;
  readonly exclude?: RegExp;
  readonly cacheControl?: CacheControl | ((path: string) => CacheControl);
}

export function staticFiles(
  root: string,
  options: Options = {},
): Koa.Middleware {
  root = normalize(resolve(root));
  const {
    include = null,
    exclude = null,
    tagger = fastTagger,
    cacheControl = null,
  } = options;

  const middleware = async (
    ctx: Koa.Context,
    next: Koa.Next,
  ): Promise<void> => {
    let { method, path } = ctx.request;

    path = normalizeUriPath(path); // TODO This must be a part of Koa.

    if (method !== "HEAD" && method !== "GET") {
      return next();
    }
    if (include != null && !include.test(path)) {
      return next();
    }
    if (exclude != null && exclude.test(path)) {
      return next();
    }

    const variant = await findVariant(ctx, join(root, path));
    if (variant == null) {
      return next();
    }

    const { type, variantEncoding, variantPath, variantStats } = variant;

    ctx.response.set("Content-Encoding", variantEncoding.name);
    ctx.response.vary("Content-Encoding");
    ctx.response.type = type;
    ctx.response.length = variantStats.size;
    ctx.response.body = createReadStream(variantPath);

    if (tagger != null) {
      let etag = await tagger(variantPath, variantStats);
      if (variantEncoding !== Encoding.identity) {
        etag = etag + "-" + variantEncoding.name;
      }
      ctx.response.etag = etag;
    }

    const cacheHeader = getCacheHeader(ctx, path);
    if (cacheHeader != null) {
      ctx.response.set("Cache-Control", cacheHeader);
    }
  };
  Object.defineProperty(middleware, "name", {
    value: "staticFiles",
  });
  return middleware;

  function getCacheHeader(ctx: Koa.Context, path: string): string | null {
    if (cacheControl != null) {
      let cc: CacheControl;
      switch (typeof cacheControl) {
        case "object":
          cc = cacheControl;
          break;
        case "function":
          cc = cacheControl(path);
          break;
      }
      const { maxAge = null, immutable = false } = cc;
      if (maxAge != null || immutable) {
        const fields = ["public"];
        if (maxAge != null) {
          fields.push("max-age=" + Math.max(0, Math.floor(maxAge)));
        }
        if (immutable) {
          fields.push("immutable");
        }
        return fields.join(", ");
      }
    }
    return null;
  }
}
