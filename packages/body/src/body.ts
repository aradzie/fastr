import { BadRequestError } from "@fastr/errors";
import { MediaType } from "@fastr/headers";
import { type IncomingHttpHeaders } from "http";
import { type IParseOptions, parse } from "qs";
import { type Readable } from "stream";
import { type Encoding, getEncoding, readAll } from "./encoding.js";
import { UTF8 } from "./type.js";

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
  /**
   * The default charset to use if not specified in a request.
   *
   * The default value is `UTF-8`.
   */
  readonly charset?: string;
}

export class Body {
  static acceptsEncoding = ["gzip", "deflate", "br"] as const;

  static from(message: IncomingMessage, options: BodyOptions = {}): Body {
    return new Body(message, options);
  }

  private readonly _maxLength: number | null;
  private readonly _charset: string | null;
  private readonly _length: number | null;
  private readonly _encoding: Encoding;
  private readonly _type: MediaType;
  private readonly _stream: Readable;
  private _bodyUsed = false;

  private constructor(message: IncomingMessage, options: BodyOptions) {
    const { headers } = message;
    const { maxLength = null, charset = null } = options;
    const length = headers["content-length"] ?? null;
    const encoding = headers["content-encoding"] ?? "identity";
    const type = headers["content-type"] ?? "application/octet-stream";
    this._maxLength = maxLength;
    this._charset = charset;
    this._length = length == null ? null : Number(length);
    this._encoding = getEncoding(encoding);
    this._type = MediaType.parse(type);
    this._stream = message;
  }

  /**
   * Returns value of the `Content-Encoding` header or
   * just `application/octet-stream` if absent.
   */
  get type(): MediaType {
    return this._type;
  }

  /**
   * Returns a boolean value indicating whether the body stream has already been
   * consumed.
   */
  get bodyUsed(): boolean {
    return this._bodyUsed;
  }

  /**
   * Reads the whole body response as a single buffer.
   *
   * @throws PayloadTooLargeError If received body size is above the configured
   *                              limit.
   */
  async buffer(): Promise<Buffer> {
    this.setBodyUsed();
    const {
      _length: length,
      _maxLength: maxLength,
      _encoding: encoding,
      _stream: req,
    } = this;
    return readAll({
      length,
      maxLength,
      encoding,
      stream: req,
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
      toBufferEncoding(
        this._type.params.get("charset") ?? this._charset ?? UTF8,
      ),
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

  private setBodyUsed(): void {
    if (this._bodyUsed) {
      throw new Error("Body already used");
    }
    this._bodyUsed = true;
  }
}

function toBufferEncoding(charset: string): BufferEncoding {
  switch (charset) {
    case "UTF-8":
    case "UTF8":
    case "utf-8":
    case "utf8":
      return "utf8";
    case "UTF-16":
    case "UTF16":
    case "utf-16":
    case "utf16":
      return "utf16le";
    case "ASCII":
    case "ascii":
      return "ascii";
  }
  switch (charset.toLowerCase()) {
    case "utf-8":
    case "utf8":
      return "utf8";
    case "utf-16":
    case "utf16":
    case "utf-16le":
    case "utf16le":
      return "utf16le";
    case "iso-8859-1":
    case "latin1":
      return "latin1";
    case "ascii":
      return "ascii";
  }
  // NodeJS does not understand this charset natively.
  throw new BadRequestError(`Unsupported charset [${charset}]`); // TODO Client side body in a request.
}
