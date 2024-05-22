import { type IncomingHttpHeaders } from "node:http";
import { type Readable } from "node:stream";
import { BadRequestError } from "@fastr/errors";
import { MediaType } from "@fastr/headers";
import { type IParseOptions, parse } from "qs";
import { toBufferEncoding } from "./charset.js";
import { type Encoding, getEncoding, readAll } from "./encoding.js";
import { UTF8 } from "./payload.js";

export interface IncomingMessage extends Readable {
  readonly headers: IncomingHttpHeaders;
}

export interface BodyOptions {
  /**
   * The maximal received body size in bytes.
   *
   * If the received body data is larger than this size then
   * the `PayloadTooLargeError` error will be thrown.
   *
   * By default there is no limit on body size.
   */
  readonly maxLength?: number;
}

export class Body {
  static acceptsEncoding = ["gzip", "deflate", "br"] as const;

  static from(message: IncomingMessage, options: BodyOptions = {}): Body {
    return new Body(message, options);
  }

  readonly #maxLength: number | null;
  readonly #length: number | null;
  readonly #encoding: Encoding;
  readonly #type: MediaType;
  readonly #stream: Readable;
  #bodyUsed = false;

  private constructor(message: IncomingMessage, options: BodyOptions) {
    const { headers } = message;
    const { maxLength = null } = options;
    const length = headers["content-length"] ?? null;
    const encoding = headers["content-encoding"] ?? "identity";
    const type = headers["content-type"] ?? "application/octet-stream";
    this.#maxLength = maxLength;
    this.#length = length == null ? null : Number(length);
    this.#encoding = getEncoding(encoding);
    this.#type = MediaType.parse(type);
    this.#stream = message;
  }

  /**
   * Returns value of the `Content-Encoding` header or
   * just `application/octet-stream` if absent.
   */
  get type(): MediaType {
    return this.#type;
  }

  /**
   * Returns a boolean value indicating whether the body stream has already been
   * consumed.
   */
  get bodyUsed(): boolean {
    return this.#bodyUsed;
  }

  /**
   * Reads the whole body response as a single buffer.
   *
   * @throws PayloadTooLargeError If received body size is above the configured
   *                              limit.
   */
  async buffer(): Promise<Buffer> {
    this.#setBodyUsed();
    return readAll({
      maxLength: this.#maxLength,
      length: this.#length,
      encoding: this.#encoding,
      stream: this.#stream,
    });
  }

  /**
   * Reads the whole body response as a single string.
   *
   * @throws PayloadTooLargeError If received body size is above the configured
   *                              limit.
   */
  async text(): Promise<string> {
    return (await this.buffer()).toString(
      toBufferEncoding(this.#type.params.get("charset") ?? UTF8),
    );
  }

  /**
   * Reads the whole body response as a single string then parses it as JSON.
   *
   * @throws BadRequestError If the body cannot be parsed as JSON.
   * @throws PayloadTooLargeError If received body size is above the configured
   *                              limit.
   */
  async json<T>(
    reviver?: (this: any, key: string, value: any) => any,
  ): Promise<T> {
    const text = await this.text();
    try {
      return JSON.parse(text, reviver);
    } catch {
      throw new BadRequestError(); // TODO Client side body in a request.
    }
  }

  /**
   * Reads the whole body response as a single string then parses it as form
   * data using the `qs` library.
   *
   * @throws BadRequestError If the body cannot be parsed as form data.
   * @throws PayloadTooLargeError If received body size is above the configured
   *                              limit.
   */
  async form(options?: IParseOptions): Promise<unknown> {
    const text = await this.text();
    try {
      return parse(text, options);
    } catch {
      throw new BadRequestError(); // TODO Client side body in a request.
    }
  }

  #setBodyUsed(): void {
    if (this.#bodyUsed) {
      throw new Error("Body already used");
    }
    this.#bodyUsed = true;
  }
}
