import { type OutgoingHttpHeader, type OutgoingHttpHeaders } from "http";
import { Writable } from "stream";
import { FakeSocket } from "./socket.js";

export class FakeOutgoingMessage extends Writable {
  #data: Buffer[] = [];
  #headers = new Map<string, OutgoingHttpHeader>();
  #headersSent = false;
  #statusCode: number;
  #statusMessage: string;

  chunkedEncoding = false;
  shouldKeepAlive = false;

  socket = new FakeSocket();

  constructor({
    statusCode = 200,
    statusMessage = "OK",
  }: {
    readonly statusCode?: number;
    readonly statusMessage?: string;
  } = {}) {
    super();
    this.#statusCode = statusCode;
    this.#statusMessage = statusMessage;
  }

  get statusCode(): number {
    return this.#statusCode;
  }

  set statusCode(value: number) {
    this.#statusCode = value;
  }

  get statusMessage(): string {
    return this.#statusMessage;
  }

  set statusMessage(value: string) {
    this.#statusMessage = value;
  }

  setTimeout() {}

  setHeader(name: string, value: OutgoingHttpHeader): this {
    // TODO value is array
    const key = name.toLowerCase();
    this.#headers.set(key, String(value));
    return this;
  }

  appendHeader(name: string, value: OutgoingHttpHeader): this {
    // TODO value is array
    const key = name.toLowerCase();
    const list = this.#headers.get(key);
    if (Array.isArray(list)) {
      this.#headers.set(key, [...list, String(value)]);
    } else {
      this.#headers.set(key, String(value));
    }
    return this;
  }

  getHeader(name: string): OutgoingHttpHeader | undefined {
    const key = name.toLowerCase();
    return this.#headers.get(key);
  }

  hasHeader(name: string): boolean {
    const key = name.toLowerCase();
    return this.#headers.has(key);
  }

  removeHeader(name: string): void {
    const key = name.toLowerCase();
    this.#headers.delete(key);
  }

  getHeaderNames(): string[] {
    return [...this.#headers.keys()];
  }

  getHeaders(): OutgoingHttpHeaders {
    const headers = Object.create(null);
    for (const [name, value] of this.#headers) {
      headers[name] = value;
    }
    return headers;
  }

  flushHeaders(): void {
    this.#headersSent = true;
  }

  get headersSent(): boolean {
    return this.#headersSent;
  }

  writeHead(
    statusCode: number,
    statusMessage?: string,
    headers?: OutgoingHttpHeaders | OutgoingHttpHeader[],
  ): this;
  writeHead(
    statusCode: number,
    headers?: OutgoingHttpHeaders | OutgoingHttpHeader[],
  ): this;
  writeHead(...args: any[]): this {
    return this;
  }

  override end(cb?: () => void): this;
  override end(chunk: any, cb?: () => void): this;
  override end(chunk: any, encoding: BufferEncoding, cb?: () => void): this;
  override end(...args: any[]): this {
    this.#headersSent = true;
    super.end(...args);
    this.emit("end");
    return this;
  }

  override _write(
    chunk: any,
    encoding: BufferEncoding,
    cb: (error?: Error | null) => void,
  ): void {
    this.#data.push(Buffer.from(chunk, encoding));
    cb();
  }

  getData(): Buffer;
  getData(encoding: BufferEncoding): string;
  getData(encoding?: BufferEncoding): Buffer | string {
    const data = Buffer.concat(this.#data);
    if (encoding != null) {
      return data.toString(encoding);
    } else {
      return data;
    }
  }

  get [Symbol.toStringTag](): string {
    return "FakeOutgoingMessage";
  }
}
