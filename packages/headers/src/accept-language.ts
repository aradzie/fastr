import { Accepted, head, negotiateAll, type Weighted } from "./accepted.js";
import { type Header, type IncomingHeaders, parseOrThrow } from "./headers.js";
import { readWeight } from "./params.js";
import { isToken, Scanner, Separator } from "./syntax.js";

/**
 * The `Accept-Language` header.
 *
 * @see https://httpwg.org/specs/rfc9110.html#field.accept-language
 */
export class AcceptLanguage implements Header {
  static get(headers: IncomingHeaders): AcceptLanguage {
    return (
      headers.map("Accept-Language", AcceptLanguage.parse) ??
      new AcceptLanguage()
    );
  }

  static from(value: AcceptLanguage | string): AcceptLanguage {
    if (typeof value === "string") {
      return AcceptLanguage.parse(value);
    } else {
      return value;
    }
  }

  static parse(input: string): AcceptLanguage {
    return parseOrThrow(AcceptLanguage, input);
  }

  static tryParse(input: string): AcceptLanguage | null {
    // Accept-Language = #( language-range [ weight ] )
    // language-range  = <language-range, see [RFC4647], Section 2.1>
    // weight           = OWS ";" OWS "q=" qvalue
    // qvalue           = ( "0" [ "." 0*3DIGIT ] )
    //                  / ( "1" [ "." 0*3("0") ] )
    const header = new AcceptLanguage();
    const scanner = new Scanner(input);
    while (true) {
      const token = scanner.readToken();
      if (token == null) {
        return null;
      }
      const q: Weighted = { q: 1 };
      if (!readWeight(scanner, q)) {
        return null;
      }
      header.add(token, q.q);
      if (!scanner.hasNext()) {
        break;
      }
      if (!scanner.readChar(Separator.Comma)) {
        return null;
      }
      scanner.skipWs();
    }
    return header;
  }

  /**
   * Returns an `AcceptLanguage` instance which accepts `"*"`.
   */
  static any(): AcceptLanguage {
    return new AcceptLanguage().add("*");
  }

  private readonly _list: AcceptedLanguage[] = [];

  constructor(...items: readonly string[]) {
    for (const item of items) {
      this.add(item);
    }
  }

  /**
   * Adds a new accepted language with the given quality parameter.
   */
  add(value: string, q = 1): this {
    this._list.push(new AcceptedLanguage(new Language(value), q));
    return this;
  }

  accepts(candidate: string): boolean {
    return this.negotiate(candidate) === candidate;
  }

  negotiateAll(...candidates: readonly string[]): string[] {
    if (candidates.length === 0) {
      throw new TypeError("Empty candidates");
    }
    if (this._list.length === 0) {
      return [...candidates];
    }
    return negotiateAll(candidates, this._list, (v) => new Language(v));
  }

  negotiate(...candidates: readonly string[]): string | null {
    return head(this.negotiateAll(...candidates));
  }

  toString(): string {
    return this._list.map((item) => String(item)).join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "AcceptLanguage";
  }
}

class AcceptedLanguage extends Accepted<Language> {
  readonly lang: Language;

  constructor(lang: Language, q: number) {
    super();
    this.q = q;
    this.lang = lang;
  }

  override compare(candidate: Language): number | null {
    if (this.lang.valueLc === candidate.valueLc) {
      return 4000; // "en-US" === "en-US"
    }
    if (this.lang.prefixLc === candidate.valueLc) {
      return 2000; // "en-US" === "en"
    }
    if (this.lang.valueLc === candidate.prefixLc) {
      return 1000; // "en" === "en-US"
    }
    if (this.lang.valueLc === "*") {
      return 0;
    }
    return null;
  }

  override toString(): string {
    if (this.q < 1) {
      return `${this.lang}; q=${this.q}`;
    } else {
      return String(this.lang);
    }
  }
}

class Language {
  readonly value: string;
  readonly valueLc: string;
  readonly prefixLc: string;
  readonly suffixLc: string;

  constructor(value: string) {
    if (!isToken(value)) {
      throw new TypeError();
    }
    const valueLc = value.toLowerCase();
    const i = valueLc.indexOf("/");
    let prefixLc: string;
    let suffixLc: string;
    if (i > 0 && i < value.length - 1) {
      prefixLc = valueLc.substring(0, i);
      suffixLc = valueLc.substring(i + 1);
    } else {
      prefixLc = valueLc;
      suffixLc = "";
    }
    this.value = value;
    this.valueLc = valueLc;
    this.prefixLc = prefixLc;
    this.suffixLc = suffixLc;
  }

  toString(): string {
    return this.value;
  }
}
