import { BadRequestError } from "@webfx-http/error";
import { MediaType } from "@webfx-http/headers";
import type { IncomingHttpHeaders } from "http";
import type { IParseOptions } from "qs";
import { parse } from "qs";
import { Readable } from "stream";
import { normalizeCharset } from "./charset";
import type { Encoding } from "./encoding";
import { getEncoding, readAll } from "./encoding";

export interface BodyMessage extends Readable {
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
  readonly lengthLimit?: number;
  /**
   * The default charset to use if not specified in a request.
   *
   * The default value is `UTF-8`.
   */
  readonly charset?: string;
}

export class Body {
  static from(incomingMessage: BodyMessage, options: BodyOptions = {}): Body {
    return new Body(incomingMessage, options);
  }

  private readonly _lengthLimit: number | null;
  private readonly _charset: string | null;
  private readonly _length: number | null;
  private readonly _encoding: Encoding;
  private readonly _type: MediaType;
  private readonly _stream: Readable;
  private _bodyUsed = false;

  private constructor(incomingMessage: BodyMessage, options: BodyOptions) {
    const { lengthLimit = null, charset = null } = options;
    const { headers } = incomingMessage;
    const length = headers["content-length"] ?? null;
    const encoding = headers["content-encoding"] ?? "identity";
    const type = headers["content-type"] ?? "application/octet-stream";
    this._lengthLimit = lengthLimit;
    this._charset = charset;
    this._length = length == null ? null : Number(length);
    this._encoding = getEncoding(encoding);
    this._type = MediaType.parse(type);
    this._stream = incomingMessage;
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
  buffer(): Promise<Buffer> {
    this.setBodyUsed();
    const {
      _length: length,
      _lengthLimit: lengthLimit,
      _encoding: encoding,
      _stream: req,
    } = this;
    return readAll({
      length,
      lengthLimit,
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
      normalizeCharset(
        this._type?.parameters?.get("charset") ?? this._charset ?? "utf-8",
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
  async json<T extends unknown>(
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
  async form(options?: IParseOptions): Promise<any> {
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
