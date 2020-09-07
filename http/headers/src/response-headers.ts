import type { CacheControl } from "./cache-control";
import type { ETag } from "./etag";
import { HttpHeaders } from "./headers";
import type { MediaType } from "./media-type";
import type { SetCookie } from "./set-cookie";
import { stringifyDate } from "./syntax";
import type { NameValueEntries } from "./types";

export class ResponseHeaders extends HttpHeaders {
  constructor(
    data:
      | HttpHeaders
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ) {
    super(data);
  }

  /**
   * Sets the `Content-Length` header to the given value.
   */
  contentLength(value: number): this {
    this.set("Content-Length", String(value));
    return this;
  }

  /**
   * Sets the `Content-Encoding` header to the given value.
   */
  contentEncoding(value: string): this {
    this.set("Content-Encoding", String(value));
    return this;
  }

  /**
   * Sets the `Content-Type` header to the given value.
   */
  contentType(value: MediaType | string): this {
    this.set("Content-Type", String(value));
    return this;
  }

  /**
   * Sets the `Cache-Control` header to the given value.
   */
  cacheControl(value: CacheControl | string): this {
    this.set("Cache-Control", String(value));
    return this;
  }

  /**
   * Sets the `ETag` header to the given value.
   */
  etag(value: ETag | string): this {
    this.set("ETag", String(value));
    return this;
  }

  /**
   * Sets the `Last-Modified` header to the given value.
   */
  lastModified(value: Date | string): this {
    this.set("Last-Modified", stringifyDate(value));
    return this;
  }

  vary(value: string): this {
    this.append("Vary", value);
    return this;
  }

  cookie(value: SetCookie | string): this {
    this.append("Set-Cookie", String(value));
    return this;
  }
}
