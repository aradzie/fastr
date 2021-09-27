import { InvalidMediaTypeError } from "./errors.js";
import { escapeToken, Scanner } from "./syntax.js";
import type { Header, NameValueEntries } from "./types.js";
import { entriesOf } from "./util.js";

export class MediaType implements Header {
  static from(value: MediaType | string): MediaType {
    if (typeof value === "string") {
      return MediaType.parse(value);
    } else {
      return value;
    }
  }

  /**
   * See https://tools.ietf.org/html/rfc7231#section-3.1.1.1
   */
  static parse(input: string): MediaType {
    switch (input) {
      case "*/*":
        return MediaType.ANY;
      case "application/octet-stream":
        return MediaType.APPLICATION_OCTET_STREAM;
      case "application/json":
        return MediaType.APPLICATION_JSON;
      case "text/plain":
        return MediaType.TEXT_PLAIN;
      case "text/html":
        return MediaType.TEXT_HTML;
      case "text/xml":
        return MediaType.TEXT_XML;
      case "application/x-www-form-urlencoded":
        return MediaType.APPLICATION_FORM_URLENCODED_TYPE;
      case "multipart/form-data":
        return MediaType.MULTIPART_FORM_DATA;
    }
    const scanner = new Scanner(input);
    const type = scanner.readToken();
    if (type == null) {
      throw new InvalidMediaTypeError();
    }
    if (!scanner.readSeparator(0x2f /* / */)) {
      throw new InvalidMediaTypeError();
    }
    const subtype = scanner.readToken();
    if (subtype == null) {
      throw new InvalidMediaTypeError();
    }
    return new MediaType(
      type.toLowerCase(),
      subtype.toLowerCase(),
      scanner.readParams(),
    );
  }

  /**
   * The `application/octet-stream` mime type.
   */
  static readonly APPLICATION_OCTET_STREAM = new MediaType(
    "application",
    "octet-stream",
  );

  /**
   * The wildcard type mime type.
   */
  static readonly ANY = new MediaType("*", "*");

  /**
   * The `application/json` mime type.
   */
  static readonly APPLICATION_JSON = new MediaType("application", "json");

  /**
   * The `text/plain` mime type.
   */
  static readonly TEXT_PLAIN = new MediaType("text", "plain");

  /**
   * The `text/html` mime type.
   */
  static readonly TEXT_HTML = new MediaType("text", "html");

  /**
   * The `text/xml` mime type.
   */
  static readonly TEXT_XML = new MediaType("text", "xml");

  /**
   * The `application/x-www-form-urlencoded` mime type.
   */
  static readonly APPLICATION_FORM_URLENCODED_TYPE = new MediaType(
    "application",
    "x-www-form-urlencoded",
  );

  /**
   * The `multipart/form-data` mime type.
   */
  static readonly MULTIPART_FORM_DATA = new MediaType("multipart", "form-data");

  /**
   * Full name without parameters.
   */
  readonly name: string;
  /**
   * Name before the slash.
   */
  readonly type: string;
  /**
   * Name after the slash.
   */
  readonly subtype: string;
  /**
   * Optional parameters.
   */
  readonly parameters: ReadonlyMap<string, string>;

  constructor(
    type: string,
    subtype: string,
    parameters:
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ) {
    this.name = type + "/" + subtype;
    this.type = type;
    this.subtype = subtype;
    const map = new Map();
    if (parameters != null) {
      for (const [name, value] of entriesOf(
        parameters as Map<string, unknown>,
      )) {
        map.set(name.toLowerCase(), value);
      }
    }
    this.parameters = map;
  }

  matches(that: MediaType | string): boolean {
    that = MediaType.from(that);
    return (
      (this.type === "*" || //
        that.type === "*" ||
        this.type === that.type) &&
      (this.subtype === "*" || //
        that.subtype === "*" ||
        this.subtype === that.subtype)
    );
  }

  toString(): string {
    const parts: string[] = [];
    parts.push(`${this.type}/${this.subtype}`);
    for (const [name, value] of this.parameters) {
      parts.push(`${name}=${escapeToken(value)}`);
    }
    return parts.join("; ");
  }

  get [Symbol.toStringTag](): string {
    return "MediaType";
  }
}
