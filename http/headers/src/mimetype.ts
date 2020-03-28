import { Parameters } from "./parameters";
import { splitPair } from "./strings";

export class MimeType {
  static from(value: MimeType | string): MimeType {
    if (typeof value === "string") {
      return MimeType.parse(value);
    } else {
      return value;
    }
  }

  static parse(value: string): MimeType {
    switch (value) {
      case "*/*":
        return MimeType.ANY;
      case "application/octet-stream":
        return MimeType.APPLICATION_OCTET_STREAM;
      case "application/json":
        return MimeType.APPLICATION_JSON;
      case "text/plain":
        return MimeType.TEXT_PLAIN;
      case "text/html":
        return MimeType.TEXT_HTML;
      case "text/xml":
        return MimeType.TEXT_XML;
      case "application/x-www-form-urlencoded":
        return MimeType.APPLICATION_FORM_URLENCODED_TYPE;
      case "multipart/form-data":
        return MimeType.MULTIPART_FORM_DATA;
    }
    const [head, tail] = splitPair(value, ";");
    if (head) {
      const [type, subtype] = splitPair(head, "/");
      if (type && subtype) {
        return new MimeType(
          type.toLowerCase(),
          subtype.toLowerCase(),
          tail ? Parameters.from(tail) : null,
        );
      }
    }
    return MimeType.APPLICATION_OCTET_STREAM; // We never fail.
  }

  /**
   * The `application/octet-stream` mime type.
   */
  static readonly APPLICATION_OCTET_STREAM = new MimeType(
    "application",
    "octet-stream",
  );

  /**
   * The wildcard type mime type.
   */
  static readonly ANY = new MimeType("*", "*");

  /**
   * The `application/json` mime type.
   */
  static readonly APPLICATION_JSON = new MimeType("application", "json");

  /**
   * The `text/plain` mime type.
   */
  static readonly TEXT_PLAIN = new MimeType("text", "plain");

  /**
   * The `text/html` mime type.
   */
  static readonly TEXT_HTML = new MimeType("text", "html");

  /**
   * The `text/xml` mime type.
   */
  static readonly TEXT_XML = new MimeType("text", "xml");

  /**
   * The `application/x-www-form-urlencoded` mime type.
   */
  static readonly APPLICATION_FORM_URLENCODED_TYPE = new MimeType(
    "application",
    "x-www-form-urlencoded",
  );

  /**
   * The `multipart/form-data` mime type.
   */
  static readonly MULTIPART_FORM_DATA = new MimeType("multipart", "form-data");

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

  matches(that: MimeType | string): boolean {
    that = MimeType.from(that);
    return (
      (this.type === "*" || //
        that.type === "*" ||
        this.type === that.type) &&
      (this.subtype === "*" || //
        that.subtype === "*" ||
        this.subtype === that.subtype)
    );
  }

  withCharset(charset: string): MimeType {
    return new MimeType(
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
