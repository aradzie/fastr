import { BadRequestError } from "@webfx-http/error";
import { MimeType } from "@webfx-http/headers";
import { IncomingHttpHeaders } from "http";
import { IParseOptions, parse } from "qs";
import { Readable } from "stream";
import { normalizeCharset } from "./charset";
import { Encoding, getEncoding, readAll } from "./encoding";

export interface BodyMessage extends Readable {
  readonly headers: IncomingHttpHeaders;
}

export interface BodyOptions {
  /**
   * The maximal received body size in bytes.
   *
   * If the received body data is larger than this size then
   * the `PayloadTooLargeError` error will be thrown.
   */
  readonly lengthLimit?: number;
  /**
   * The default charset to use if not specified in a request.
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
  private readonly _type: MimeType;
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
    this._type = MimeType.parse(type);
    this._stream = incomingMessage;
  }

  /**
   * Returns value of the `Content-Encoding` header or
   * just `application/octet-stream` if absent.
   */
  get type(): MimeType {
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
   */
  async text(): Promise<string> {
    return (await this.buffer()).toString(
      normalizeCharset(
        this._type?.parameters?.charset ?? this._charset ?? "utf-8",
      ),
    );
  }

  /**
   * Reads the whole body response as a single string then parses it as JSON.
   *
   * @throws BadRequestError If the body cannot be parsed as JSON.
   */
  async json(
    reviver?: (this: any, key: string, value: any) => any,
  ): Promise<any> {
    const text = await this.text();
    try {
      return JSON.parse(text, reviver);
    } catch {
      throw new BadRequestError();
    }
  }

  /**
   * Reads the whole body response as a single string then parses it as form
   * data using the `qs` library.
   *
   * @throws BadRequestError If the body cannot be parsed as form data.
   */
  async form(options?: IParseOptions): Promise<any> {
    const text = await this.text();
    try {
      return parse(text, options);
    } catch {
      throw new BadRequestError();
    }
  }

  private setBodyUsed(): void {
    if (this._bodyUsed) {
      throw new Error("Body already used");
    }
    this._bodyUsed = true;
  }
}
