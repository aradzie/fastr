import { entriesOf, type NameValueEntries } from "./entries.js";
import { type Header, parseOrThrow } from "./headers.js";
import { Params } from "./params.js";
import { readParams } from "./syntax/params.js";
import { Scanner, Separator } from "./syntax/syntax.js";
import { readUriReference } from "./syntax/uri-reference.js";

export class LinkEntry {
  readonly params = new Params();

  constructor(
    public uri: string,
    params: NameValueEntries | null = null,
  ) {
    if (params != null) {
      for (const [name, value] of entriesOf(params)) {
        this.params.set(name, value);
      }
    }
  }

  toString(): string {
    if (this.params.size === 0) {
      return `<${this.uri}>`;
    } else {
      return `<${this.uri}>; ${this.params}`;
    }
  }
}

const headerName = "Link";
const headerNameLc = "link";

/**
 * The `Link` header.
 *
 * @see https://httpwg.org/specs/rfc8288.html
 */
export class Link implements Header, Iterable<LinkEntry> {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: Link | string): Link {
    if (typeof value === "string") {
      return Link.parse(value);
    } else {
      return value;
    }
  }

  static parse(input: string): Link {
    return parseOrThrow(Link, input);
  }

  static tryParse(input: string): Link | null {
    const header = new Link();
    const scanner = new Scanner(input);
    while (true) {
      const uri = readUriReference(scanner);
      if (uri == null) {
        return null;
      }
      const entry = new LinkEntry(uri);
      if (!readParams(scanner, entry.params)) {
        return null;
      }
      header.add(entry);
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

  readonly #list: LinkEntry[] = [];

  constructor(...entries: readonly LinkEntry[]) {
    for (const entry of entries) {
      this.add(entry);
    }
  }

  [Symbol.iterator](): IterableIterator<LinkEntry> {
    return this.#list[Symbol.iterator]();
  }

  add(entry: LinkEntry): void {
    this.#list.push(entry);
  }

  toString(): string {
    return [...this.#list].join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "Link";
  }
}
