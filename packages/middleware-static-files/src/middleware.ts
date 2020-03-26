import { type Context, type Middleware, type Next } from "@fastr/core";
import { type CacheControl } from "@fastr/headers";
import { createReadStream } from "@sosimple/fsx";
import { join, normalize, resolve } from "path";
import { Encoding } from "./encoding.js";
import { fastTagger, type Tagger } from "./etag.js";
import { normalizeUriPath } from "./path.js";
import { findVariant, type Variant } from "./variant.js";

export interface StaticFilesOptions {
  readonly tagger?: Tagger | null;
  readonly include?: RegExp | null;
  readonly exclude?: RegExp | null;
  readonly cacheControl?:
    | CacheControl
    | ((path: string) => CacheControl | null)
    | null;
}

export function staticFiles(
  root: string,
  {
    include = null,
    exclude = null,
    tagger = fastTagger,
    cacheControl = null,
  }: StaticFilesOptions = {},
): Middleware {
  root = normalize(resolve(root));

  const getCacheHeader = (path: string): CacheControl | null => {
    if (cacheControl != null) {
      if (typeof cacheControl === "function") {
        return cacheControl(path);
      }
      if (typeof cacheControl === "object") {
        return cacheControl;
      }
    }
    return null;
  };

  const sendVariant = async (
    ctx: Context,
    path: string,
    { type, variantEncoding, variantPath, variantStats }: Variant,
  ): Promise<void> => {
    ctx.response.headers.set("Content-Encoding", variantEncoding.name);
    ctx.response.headers.append("Vary", "Content-Encoding");
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

    const cacheHeader = getCacheHeader(path);
    if (cacheHeader != null) {
      ctx.response.headers.set("Cache-Control", cacheHeader);
    }
  };

  return async (ctx: Context, next: Next): Promise<void> => {
    let { method, path } = ctx.request;
    if (method !== "HEAD" && method !== "GET") {
      return next();
    }
    if (path === "") {
      return next();
    }
    path = normalizeUriPath(path);
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

    await sendVariant(ctx, path, variant);
  };
}
