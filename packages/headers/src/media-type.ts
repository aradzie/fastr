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
  #type: string;
  /**
   * Name after the slash.
   */
  #subtype: string;
  /**
   * Full name.
   */
  #essence: string | null;
  /**
   * Optional parameters.
   */
  readonly #params = new Params();

  constructor(
    type: string,
    subtype: string,
    params: NameValueEntries | null = null,
  ) {
    if (!isToken(type)) {
      throw new TypeError();
    }
    if (!isToken(subtype)) {
      throw new TypeError();
    }
    this.#type = type;
    this.#subtype = subtype;
    this.#essence = null;
    if (params != null) {
      for (const [name, value] of entriesOf(params)) {
        this.#params.set(name, value);
      }
    }
  }

  get essence(): string {
    return (this.#essence ??= `${this.#type}/${this.#subtype}`);
  }

  get type(): string {
    return this.#type;
  }

  set type(value: string) {
    if (!isToken(value)) {
      throw new TypeError();
    }
    this.#type = value.toLowerCase();
    this.#essence = null;
  }

  get subtype(): string {
    return this.#subtype;
  }

  set subtype(value: string) {
    if (!isToken(value)) {
      throw new TypeError();
    }
    this.#subtype = value.toLowerCase();
    this.#essence = null;
  }

  get params(): Params {
    return this.#params;
  }

  matches(that: MediaType | string): boolean {
    that = MediaType.from(that);
    return (
      (this.#type === "*" || //
        that.#type === "*" ||
        this.#type === that.#type) &&
      (this.#subtype === "*" || //
        that.#subtype === "*" ||
        this.#subtype === that.#subtype)
    );
  }

  toString(): string {
    if (this.#params.size === 0) {
      return `${this.essence}`;
    } else {
      return `${this.essence}; ${this.#params}`;
    }
  }

  get [Symbol.toStringTag](): string {
    return "MediaType";
  }
}
