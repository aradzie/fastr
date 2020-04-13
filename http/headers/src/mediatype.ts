import { Parameters } from "./parameters";
import { splitPair } from "./strings";

export class MediaType {
  static from(value: MediaType | string): MediaType {
    if (typeof value === "string") {
      return MediaType.parse(value);
    } else {
      return value;
    }
  }

  static parse(value: string): MediaType {
    // See https://mimesniff.spec.whatwg.org/#parsing-a-mime-type
    // See https://tools.ietf.org/html/rfc7231#section-3.1.1.1
    switch (value) {
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
    const [head, tail] = splitPair(value, ";");
    if (head) {
      const [type, subtype] = splitPair(head, "/");
      if (type && subtype) {
        return new MediaType(
          type.toLowerCase(),
          subtype.toLowerCase(),
          tail ? Parameters.from(tail) : null,
        );
      }
    }
    return MediaType.APPLICATION_OCTET_STREAM; // We never fail.
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
   * Optional parameters, if any.
   */
  readonly parameters: Parameters | null;

  constructor(
    type: string,
    subtype: string,
    parameters: Parameters | null = null,
  ) {
    this.name = type + "/" + subtype;
    this.type = type;
    this.subtype = subtype;
    this.parameters = parameters;
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

  withCharset(charset: string): MediaType {
    return new MediaType(
      this.type,
      this.subtype,
      new Parameters([...(this.parameters ?? []), ["charset", charset]]),
    );
  }

  toJSON(): any {
    return this.toString();
  }

  toString(): string {
    return this.parameters != null
      ? this.name + "; " + this.parameters
      : this.name;
  }
}
