import { type IncomingHttpHeaders } from "node:http";
import { Readable } from "node:stream";
import { FakeSocket } from "./socket.js";

export class FakeIncomingMessage extends Readable {
  static defaultHeaders: IncomingHttpHeaders = {
    "host": "localhost",
    "accept": "*/*",
    "user-agent": "test",
  };

  #headers: IncomingHttpHeaders = {};
  #rawHeaders: string[] = [];

  method: string;
  url: string;
  statusCode: number;
  statusMessage: string;

  httpVersion = "1.1";
  httpVersionMajor = 1;
  httpVersionMinor = 1;

  socket = new FakeSocket();

  constructor(
    data: string | Buffer | ArrayBufferView | null,
    {
      method = "GET",
      url = "/",
      statusCode = 200,
      statusMessage = "OK",
      headers = {},
    }: {
      method?: string;
      url?: string;
      statusCode?: number;
      statusMessage?: string;
      headers?: IncomingHttpHeaders;
    } = {},
  ) {
    super();
    this.method = method.toUpperCase();
    this.url = url;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    if (data == null) {
      this.push(null);
    } else if (typeof data === "string") {
      this.push(Buffer.from(data));
      this.push(null);
    } else if (Buffer.isBuffer(data)) {
      this.push(data);
      this.push(null);
    } else if (ArrayBuffer.isView(data)) {
      this.push(data);
      this.push(null);
    }
    this.setHeaders({
      ...FakeIncomingMessage.defaultHeaders,
      ...headers,
    });
  }

  setHeaders(headers: IncomingHttpHeaders): void {
    this.#headers = Object.create(null);
    this.#rawHeaders = [];
    for (const [name0, value0] of Object.entries(headers)) {
      if (value0 != null) {
        const name = name0.toLowerCase();
        const value = String(value0);
        this.#headers[name] = value0;
        this.#rawHeaders.push(name);
        this.#rawHeaders.push(value);
      }
    }
  }

  get headers(): IncomingHttpHeaders {
    return this.#headers;
  }

  get rawHeaders(): string[] {
    return this.#rawHeaders;
  }

  setTimeout() {}

  get [Symbol.toStringTag](): string {
    return "FakeIncomingMessage";
  }
}
