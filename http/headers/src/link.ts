import { splitPair } from "./strings";
import { parseTokens } from "./tokens";

export class Link {
  static of(value: Link | string): Link {
    if (typeof value === "string") {
      return Link.parse(value);
    } else {
      return value;
    }
  }

  /**
   * Creates a new instance of `Link` by parsing the given header string.
   */
  static parse(input: string): Link {
    const [head, tail] = splitPair(input, ";");
    if (!head) {
      return new Link("http://invalid/"); // We never fail.
    }
    let uri = head;
    if (uri.startsWith("<") && uri.endsWith(">")) {
      uri = uri.substring(1, uri.length - 1);
    }
    let rel = null;
    let type = null;
    let title = null;
    if (tail) {
      const tokens = parseTokens(tail);
      for (const token of tokens) {
        switch (token.name.toLowerCase()) {
          case "rel":
            if (token.value) {
              rel = token.value;
            }
            break;
          case "type":
            if (token.value) {
              type = token.value;
            }
            break;
          case "title":
            if (token.value) {
              title = token.value;
            }
            break;
        }
      }
    }
    return new Link(uri, rel, type, title);
  }

  readonly uri: string;
  readonly rel: string | null;
  readonly type: string | null;
  readonly title: string | null;

  // TODO parameters

  constructor(
    uri: URL | string,
    rel: string | null = null,
    type: string | null = null,
    title: string | null = null,
  ) {
    this.uri = String(uri);
    this.rel = rel;
    this.type = type;
    this.title = title;
  }

  toJSON(): any {
    return this.toString();
  }

  toString(): string {
    const { uri, type, rel, title } = this;
    let s = `<${uri}>`;
    if (rel) {
      s = `${s}; rel="${rel}"`;
    }
    if (type) {
      s = `${s}; type="${type}"`;
    }
    if (title) {
      s = `${s}; title="${title}"`;
    }
    return s;
  }
}
