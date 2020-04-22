import { Accept } from "./accept";
import { AcceptEncoding } from "./accept-encoding";
import { Cookie } from "./cookie";
import { ETag } from "./etag";
import { HttpHeaders } from "./headers";
import { MediaType } from "./media-type";
import { stringifyDate } from "./syntax";
import type { NameValueEntries } from "./types";

export class RequestHeaders extends HttpHeaders {
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
   * Sets the `Accept` header to the given value.
   */
  accept(value: Accept | string): this {
    this.append("Accept", String(value));
    return this;
  }

  /**
   * Sets the `Accept-Encoding` header to the given value.
   */
  acceptEncoding(value: AcceptEncoding | string): this {
    this.append("Accept-Encoding", String(value));
    return this;
  }

  /**
   * Sets the `If-Match` header to the given value.
   */
  ifMatch(value: ETag | string): this {
    this.set("If-Match", String(value));
    return this;
  }

  /**
   * Sets the `If-None-Match` header to the given value.
   */
  ifNoneMatch(value: ETag | string): this {
    this.set("If-None-Match", String(value));
    return this;
  }

  /**
   * Sets the `If-Modified-Since` header to the given value.
   */
  ifModifiedSince(value: Date | string): this {
    this.set("If-Modified-Since", stringifyDate(value));
    return this;
  }

  /**
   * Sets the `If-Unmodified-Since` header to the given value.
   */
  ifUnmodifiedSince(value: Date | string): this {
    this.set("If-Unmodified-Since", stringifyDate(value));
    return this;
  }

  cookie(name: string, value: string): this {
    const cookie = this.map("Cookie", Cookie.parse) ?? new Cookie();
    cookie.set(name, value);
    this.set("Cookie", cookie);
    return this;
  }
}
