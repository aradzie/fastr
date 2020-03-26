import { type Header, parseOrThrow } from "./headers.js";
import { escapeToken, Scanner, Separator } from "./syntax.js";

export interface ForwardedInit {
  readonly by?: string;
  readonly for?: string;
  readonly host?: string;
  readonly proto?: string;
}

const headerName = "Forwarded";
const headerNameLc = "forwarded";

/**
 * The `Forwarded` header.
 *
 * @see https://www.rfc-editor.org/rfc/rfc7239
 */
export class Forwarded implements Header {
  static readonly headerName = headerName;
  static readonly headerNameLc = headerNameLc;

  static from(value: Forwarded | string): Forwarded {
    if (typeof value === "string") {
      return Forwarded.parse(value);
    } else {
      return value;
    }
  }

  static parse(input: string): Forwarded {
    return parseOrThrow(Forwarded, input);
  }

  static tryParse(input: string): Forwarded | null {
    // forwarded   = 1#forwarded-element
    // forwarded-element =
    //     [ forwarded-pair ] *( ";" [ forwarded-pair ] )
    // forwarded-pair = token "=" value
    // value          = token / quoted-string
    //
    // Examples:
    //   Forwarded: for="_gazonk"
    //   Forwarded: For="[2001:db8:cafe::17]:4711"
    //   Forwarded: for=192.0.2.60;proto=http;by=203.0.113.43
    //   Forwarded: for=192.0.2.43, for=198.51.100.17
    //
    // Each parameter MUST NOT occur more than once per field-value.  The
    // parameter names are case-insensitive.
    const header = new Forwarded();
    const scanner = new Scanner(input);
    while (true) {
      const name = scanner.readToken();
      if (name == null) {
        return null;
      }
      scanner.skipWs();
      if (!scanner.readChar(Separator.Equals)) {
        return null;
      }
      scanner.skipWs();
      const value = scanner.readTokenOrQuotedString();
      if (value == null) {
        return null;
      }
      switch (name.toLowerCase()) {
        case "by":
          if (header.by != null) {
            return null;
          }
          header.by = value;
          break;
        case "for":
          if (header.for != null) {
            return null;
          }
          header.for = value;
          break;
        case "host":
          if (header.host != null) {
            return null;
          }
          header.host = value;
          break;
        case "proto":
          if (header.proto != null) {
            return null;
          }
          header.proto = value;
          break;
        default:
          return null;
      }
      scanner.skipWs();
      if (!scanner.hasNext()) {
        break;
      }
      if (!scanner.readChar(Separator.Semicolon)) {
        return null;
      }
      scanner.skipWs();
    }
    return header;
  }

  /**
   * "by" identifies the user-agent facing interface of the proxy.
   */
  by: string | null = null;
  /**
   * "for" identifies the node making the request to the proxy.
   */
  for: string | null = null;
  /**
   * "host" is the host request header field as received by the proxy.
   */
  host: string | null = null;
  /**
   * "proto" indicates what protocol was used to make the request.
   */
  proto: string | null = null;

  constructor(init: ForwardedInit | null = null) {
    if (init != null) {
      const { by = null, for: _for = null, host = null, proto = null } = init;
      this.by = by;
      this.for = _for;
      this.host = host;
      this.proto = proto;
    }
  }

  toString(): string {
    const items: string[] = [];
    if (this.by) {
      items.push(`by=${escapeToken(this.by)}`);
    }
    if (this.for) {
      items.push(`for=${escapeToken(this.for)}`);
    }
    if (this.host) {
      items.push(`host=${escapeToken(this.host)}`);
    }
    if (this.proto) {
      items.push(`proto=${escapeToken(this.proto)}`);
    }
    return items.join("; ");
  }

  get [Symbol.toStringTag](): string {
    return "Forwarded";
  }
}
