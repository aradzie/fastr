import { entriesOf, type NameValueEntries } from "./entries.js";
import { type Header, parseOrThrow } from "./headers.js";
import { Params } from "./params.js";
import { readParams } from "./syntax-params.js";
import { readUriReference } from "./syntax-uri-reference.js";
import { Scanner, Separator } from "./syntax.js";

export class LinkEntry {
  readonly params = new Params();

  constructor(
    public uri: string,
    params:
      | Map<string, unknown>
      | Record<string, unknown>
      | NameValueEntries
      | null = null,
  ) {
    if (params != null) {
      for (const [name, value] of entriesOf(params as NameValueEntries)) {
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

/**
 * The `Link` header.
 *
 * @see https://httpwg.org/specs/rfc8288.html
 */
export class Link implements Header, Iterable<LinkEntry> {
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

  private readonly _list: LinkEntry[] = [];

  constructor(...entries: readonly LinkEntry[]) {
    for (const entry of entries) {
      this.add(entry);
    }
  }

  [Symbol.iterator](): Iterator<LinkEntry> {
    return this._list[Symbol.iterator]();
  }

  add(entry: LinkEntry): void {
    this._list.push(entry);
  }

  toString(): string {
    return [...this._list].join(", ");
  }

  get [Symbol.toStringTag](): string {
    return "Link";
  }
}
