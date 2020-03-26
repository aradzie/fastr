import { type GetHeader } from "@fastr/headers";
import { isJSON } from "@fastr/json";
import { type OutgoingMessage } from "http";
import { Readable, type Writable } from "stream";
import { useCharset, useCharsetIfText } from "./charset.js";
import { Streamable } from "./streamable.js";

export type BodyDataType =
  | string
  | Buffer
  | ArrayBufferView
  | Readable
  | Streamable
  | URLSearchParams
  | object;

export type BodyInit = string | Buffer | Readable | Streamable;

export const UTF8 = "UTF-8";
export const TEXT_TYPE = `text/plain; charset=${UTF8}`;
export const URLENCODED_TYPE = `application/x-www-form-urlencoded; charset=${UTF8}`;
export const JSON_TYPE = `application/json; charset=${UTF8}`;
export const BINARY_TYPE = `application/octet-stream`;

export class Payload {
  readonly #type: string | null;
  readonly #length: number | null;
  readonly #body: BodyInit | null;

  constructor(body: BodyDataType | null, headers: GetHeader) {
    const type = headers.get("Content-Type");
    const length = headers.get("Content-Length");

    if (body == null) {
      this.#body = body;
      this.#type = useCharsetIfText(type ?? BINARY_TYPE);
      this.#length = null;
    } else if (typeof body === "string") {
      this.#body = body;
      this.#type = useCharset(type ?? TEXT_TYPE);
      this.#length = Buffer.byteLength(body);
    } else if (Buffer.isBuffer(body)) {
      this.#body = body;
      this.#type = useCharsetIfText(type ?? BINARY_TYPE);
      this.#length = body.byteLength;
    } else if (ArrayBuffer.isView(body)) {
      this.#body = Buffer.from(body.buffer);
      this.#type = useCharsetIfText(type ?? BINARY_TYPE);
      this.#length = body.byteLength;
    } else if (body instanceof Readable) {
      this.#body = body;
      this.#type = useCharsetIfText(type ?? BINARY_TYPE);
      this.#length = length != null ? Number(length) : null;
    } else if (body instanceof Streamable) {
      const s = (this.#body = body);
      this.#type = useCharsetIfText(type ?? BINARY_TYPE);
      this.#length = s.length();
    } else if (body instanceof URLSearchParams) {
      const s = (this.#body = String(body));
      this.#type = useCharset(type ?? URLENCODED_TYPE);
      this.#length = Buffer.byteLength(s);
    } else if (isJSON(body)) {
      const s = (this.#body = JSON.stringify(body));
      this.#type = useCharset(type ?? JSON_TYPE);
      this.#length = Buffer.byteLength(s);
    } else {
      throw new TypeError(
        `Invalid body type ${Object.prototype.toString.call(body)}`,
      );
    }
  }

  get type(): string | null {
    return this.#type;
  }

  get length(): number | null {
    return this.#length;
  }

  get body(): BodyInit | null {
    return this.#body;
  }

  async readStream(): Promise<Buffer> {
    const { body } = this;

    if (body instanceof Readable) {
      const parts: Buffer[] = [];
      for await (const item of body) {
        if (typeof item === "string") {
          parts.push(Buffer.from(item));
        } else {
          parts.push(item);
        }
      }
      return Buffer.concat(parts);
    }

    throw new TypeError(
      `Invalid body type ${Object.prototype.toString.call(body)}`,
    );
  }

  sendHeaders(message: OutgoingMessage): void {
    const { body, type, length } = this;
    if (!message.headersSent) {
      if (body == null) {
        message.removeHeader("Content-Type");
        message.removeHeader("Content-Length");
        message.removeHeader("Content-Encoding");
        message.removeHeader("Transfer-Encoding");
      } else {
        if (type != null) {
          message.setHeader("Content-Type", type);
        }
        if (length != null) {
          message.setHeader("Content-Length", length);
        }
      }
    }
  }

  send(message: OutgoingMessage): void {
    const { body } = this;
    this.sendHeaders(message);
    if (body == null) {
      message.end();
    } else {
      if (typeof body === "string" || Buffer.isBuffer(body)) {
        message.end(body);
      } else if (body instanceof Readable) {
        pipe(body, message);
      } else if (body instanceof Streamable) {
        pipe(body.open(), message);
      } else {
        throw new TypeError(
          `Invalid body type ${Object.prototype.toString.call(body)}`,
        );
      }
    }
  }
}

export function pipe<T extends Writable>(source: Readable, target: T): T {
  // TODO Check this function again. Also consider the `pipeline` function. Write tests.
  source.pipe(target, { end: true });
  source.on("error", (err) => {
    source.unpipe(target);
    // TODO source.destroy();
    target.emit("error", err);
  });
  return target;
}

export function discardBody(body: unknown): void {
  if (body instanceof Readable) {
    body.destroy(); // TODO Close body stream.
  }
}
