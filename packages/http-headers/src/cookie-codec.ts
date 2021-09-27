/**
 * To maximize compatibility with user agents, servers that wish to store
 * arbitrary data in a cookie-value SHOULD encode that data, for example,
 * using Base64.
 */
export interface CodecDelegate {
  /**
   * Takes arbitrary cookie value and encodes it to a form
   * suitable for usage in an HTTP header.
   */
  readonly encode: (value: string) => string;
  /**
   * Takes an HTTP header value and decodes it to the original cookie value.
   */
  readonly decode: (value: string) => string;
}

let delegate: CodecDelegate = new (class URICodec implements CodecDelegate {
  encode(value: string): string {
    return encodeURIComponent(value);
  }

  decode(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
})();

export class CookieCodec {
  static setDelegate(newDelegate: CodecDelegate): void {
    delegate = newDelegate;
  }

  static encode(value: string): string {
    return delegate.encode(value);
  }

  static decode(value: string): string {
    return delegate.decode(unquoteCookieValue(value));
  }
}

function unquoteCookieValue(value: string): string {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.substring(1, value.length - 1);
  } else {
    return value;
  }
}
