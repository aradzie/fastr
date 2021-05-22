import { createReadStream } from "@aradzie/fsx";
import type { CacheControl } from "@webfx-http/headers";
import type Koa from "koa";
import { join, normalize, resolve } from "path";
import { Encoding } from "./encoding.js";
import { fastTagger, Tagger } from "./etag.js";
import { normalizeUriPath } from "./path.js";
import { findVariant } from "./variant.js";

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
      if (typeof cacheControl === "function") {
        return String(cacheControl(path));
      }
      if (typeof cacheControl === "object") {
        return String(cacheControl);
      }
    }
    return null;
  }
}
