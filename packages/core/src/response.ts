import { guessContentType } from "@fastr/body";
import { ETag, MediaType, type OutgoingHeaders } from "@fastr/headers";
import { MediaTypes } from "@fastr/mediatypes";
import { isRedirect, statusMessage } from "@fastr/status";
import { type ServerResponse } from "http";
import { OutgoingMessageHeaders } from "./headers.js";

export class Response {
  readonly #res: ServerResponse;
  readonly #headers: OutgoingHeaders;
  #hijacked = false;
  #hasStatus = false;
  #hasBody = false;
  #body: unknown = null;

  constructor(res: ServerResponse) {
    this.#res = res;
    this.#headers = new OutgoingMessageHeaders(res);
  }

  get res(): ServerResponse {
    return this.#res;
  }

  get headers(): OutgoingHeaders {
    return this.#headers;
  }

  get hasStatus(): boolean {
    return this.#hasStatus;
  }

  get status(): number {
    return this.#res.statusCode;
  }

  set status(value: number) {
    this.#res.statusCode = value;
    this.#hasStatus = true;
  }

  get statusText(): string {
    return this.#res.statusMessage ?? statusMessage(this.#res.statusCode);
  }

  set statusText(value: string) {
    this.#res.statusMessage = value;
  }

  get hasBody(): boolean {
    return this.#hasBody;
  }

  get body(): unknown | null {
    return this.#body;
  }

  set body(value: unknown | null) {
    const [body, type] = guessContentType(value, null);
    this.#body = body;
    this.#hasBody = true;
    if (body == null) {
      if (!this.#hasStatus) {
        this.status = 200;
      }
      this.headers.delete("Content-Type");
      this.headers.delete("Content-Length");
      this.headers.delete("Transfer-Encoding");
    } else {
      if (!this.#hasStatus) {
        this.status = 200;
      }
      if (!this.headers.has("Content-Type") && type != null) {
        this.headers.set("Content-Type", MediaType.from(type));
      }
    }
  }

  set type(value: MediaType | string) {
    if (typeof value === "string" && value.startsWith(".")) {
      const mediaType = MediaTypes.lookupByExt(value);
      if (mediaType == null) {
        throw new TypeError(`Unknown file extension [${value}]`);
      }
      value = mediaType.type;
    }
    this.headers.set("Content-Type", value);
  }

  set length(value: number) {
    this.headers.set("Content-Length", value);
  }

  set etag(value: ETag | string) {
    this.headers.set("ETag", ETag.from(value));
  }

  redirect(url: string, statusCode = 302): void {
    this.headers.set("Location", url);
    if (!this.hasStatus || !isRedirect(this.status)) {
      this.status = statusCode;
    }
    if (!this.hasBody) {
      this.body = `Redirecting to to ${url}`;
    }
  }

  get headerSent(): boolean {
    return this.#res.headersSent;
  }

  flushHeaders(): void {
    this.#res.flushHeaders();
  }

  hijack(): void {
    this.#hijacked = true;
  }

  get hijacked(): boolean {
    return this.#hijacked;
  }

  get [Symbol.toStringTag](): string {
    return "Response";
  }
}
