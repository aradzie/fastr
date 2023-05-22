import { entriesOf, type NameValueEntries } from "./entries.js";
import { type Header } from "./headers.js";
import { Params } from "./params.js";
import { readParams } from "./syntax-params.js";
import { isToken, Scanner, Separator } from "./syntax.js";

/**
 * @see https://www.rfc-editor.org/rfc/rfc7231#section-3.1.1.1
 */
export class MediaType implements Header {
  static from(value: MediaType | string): MediaType {
    if (typeof value === "string") {
      return MediaType.parse(value);
    } else {
      return value;
    }
  }

  static parse(input: string): MediaType {
    const type = MediaType.tryParse(input);
    if (type == null) {
      throw new Error(`Invalid media type [${input}]`);
    }
    return type;
  }

  static tryParse(input: string): MediaType | null {
    switch (input) {
      case "*/*":
        return new MediaType("*", "*");
      case "application/octet-stream":
        return new MediaType("application", "octet-stream");
      case "application/json":
        return new MediaType("application", "json");
      case "text/plain":
        return new MediaType("text", "plain");
      case "text/html":
        return new MediaType("text", "html");
      case "text/css":
        return new MediaType("text", "css");
    }
    const scanner = new Scanner(input);
    const type = scanner.readToken();
    if (type == null) {
      return null;
    }
    if (!scanner.readChar(Separator.Slash)) {
      return null;
    }
    const subtype = scanner.readToken();
    if (subtype == null) {
      return null;
    }
    const mediaType = new MediaType(type.toLowerCase(), subtype.toLowerCase());
    if (!readParams(scanner, mediaType.params)) {
      return null;
    }
    if (scanner.hasNext()) {
      return null;
    }
    return mediaType;
  }

  static any() {
    return new MediaType("*", "*");
  }

  /**
   * Name before the slash.
   */
  private _type: string;
  /**
   * Name after the slash.
   */
  private _subtype: string;
  /**
   * Full name.
   */
  private _essence: string | null;
  /**
   * Optional parameters.
   */
  private readonly _params = new Params();

  constructor(
    type: string,
    subtype: string,
    params:
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ) {
    if (!isToken(type)) {
      throw new TypeError();
    }
    if (!isToken(subtype)) {
      throw new TypeError();
    }
    this._type = type;
    this._subtype = subtype;
    this._essence = null;
    if (params != null) {
      for (const [name, value] of entriesOf(params as NameValueEntries)) {
        this._params.set(name, value);
      }
    }
  }

  get essence(): string {
    return (this._essence ??= `${this._type}/${this._subtype}`);
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    if (!isToken(value)) {
      throw new TypeError();
    }
    this._type = value.toLowerCase();
    this._essence = null;
  }

  get subtype(): string {
    return this._subtype;
  }

  set subtype(value: string) {
    if (!isToken(value)) {
      throw new TypeError();
    }
    this._subtype = value.toLowerCase();
    this._essence = null;
  }

  get params(): Params {
    return this._params;
  }

  matches(that: MediaType | string): boolean {
    that = MediaType.from(that);
    return (
      (this._type === "*" || //
        that._type === "*" ||
        this._type === that._type) &&
      (this._subtype === "*" || //
        that._subtype === "*" ||
        this._subtype === that._subtype)
    );
  }

  toString(): string {
    if (this._params.size === 0) {
      return `${this.essence}`;
    } else {
      return `${this.essence}; ${this._params}`;
    }
  }

  get [Symbol.toStringTag](): string {
    return "MediaType";
  }
}
