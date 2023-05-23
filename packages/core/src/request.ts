import {
  Accept,
  AcceptEncoding,
  AcceptLanguage,
  ContentType,
  type IncomingHeaders,
} from "@fastr/headers";
import { type IncomingMessage } from "http";
import { IncomingMessageHeaders } from "./headers.js";
import { getOrigin } from "./util/origin.js";

export interface ProxyOptions {
  readonly behindProxy: boolean;
}

export class Request {
  readonly #req: IncomingMessage;
  readonly #headers: IncomingHeaders;
  readonly #href: string;
  readonly #origin: string;
  readonly #protocol: string;
  readonly #host: string;
  readonly #hostname: string;
  readonly #path: string;
  readonly #querystring: string;
  readonly #query: Record<string, string>;

  constructor(
    req: IncomingMessage,
    { behindProxy = false }: Partial<ProxyOptions>,
  ) {
    this.#req = req;
    this.#headers = new IncomingMessageHeaders(req);
    const {
      href,
      origin,
      protocol,
      host,
      hostname,
      pathname,
      search,
      searchParams,
    } = new URL(req.url!, getOrigin(req, behindProxy));
    this.#href = href;
    this.#origin = origin;
    this.#protocol = protocol.substring(0, protocol.length - 1);
    this.#host = host;
    this.#hostname = hostname;
    this.#path = pathname;
    this.#querystring = search.substring(1);
    this.#query = Object.fromEntries(searchParams);
  }

  get req(): IncomingMessage {
    return this.#req;
  }

  get headers(): IncomingHeaders {
    return this.#headers;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `"GET"`.
   */
  get method(): string {
    return this.#req.method!;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `"/path?a=1&b=2"`
   */
  get url(): string {
    return this.#req.url!;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `"https://localhost:8080/path?a=1&b=2"`.
   */
  get href(): string {
    return this.#href;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `"https://localhost:8080"`.
   *
   * If your application is running behind a proxy, and the `behindProxy`
   * option is set, then this value is obtained from headers such as
   * `Forwarded`, `X-Forwarded-Host` and `X-Forwarded-Proto`.
   */
  get origin(): string {
    return this.#origin;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `https`.
   *
   * If your application is running behind a proxy, and the `behindProxy`
   * option is set, then this value is obtained from headers such as
   * `Forwarded`, `X-Forwarded-Host` and `X-Forwarded-Proto`.
   */
  get protocol(): string {
    return this.#protocol;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `"localhost:8080"`.
   *
   * If your application is running behind a proxy, and the `behindProxy`
   * option is set, then this value is obtained from headers such as
   * `Forwarded`, `X-Forwarded-Host` and `X-Forwarded-Proto`.
   */
  get host(): string {
    return this.#host;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `"localhost"`.
   *
   * If your application is running behind a proxy, and the `behindProxy`
   * option is set, then this value is obtained from headers such as
   * `Forwarded`, `X-Forwarded-Host` and `X-Forwarded-Proto`.
   */
  get hostname(): string {
    return this.#hostname;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `"/path"`.
   *
   * The returned path is normalized, so that segments such as `/./` and `/../`
   * are removed. However, empty segments such as `//` are preserved.
   *
   * The returned path is NOT percent-decoded. Doing so might introduce
   * security risk, because dots and slashes can be percent-encoded. And when
   * the whole path is percent-decoded, additional dots and slashes may appear.
   * The right algorithm is first to split your path into segments using
   * the slash character as a separator, then percent-decode each segment
   * individually. Treat each decoded segment as a whole, even if after
   * decoding it contains dots and slashes.
   */
  get path(): string {
    return this.#path;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `"a=1&b=2"`.
   */
  get querystring(): string {
    return this.#querystring;
  }

  /**
   * If the request is `"GET https://localhost:8080/path?a=1&b=2"`
   * then the return value is `{ a: '1', b: '2' }`.
   */
  get query(): Record<string, string> {
    return this.#query;
  }

  /**
   * Returns a value indicating whether there is a body in this request.
   */
  get hasBody(): boolean {
    return (
      this.#headers.has("content-length") ||
      this.#headers.has("transfer-encoding")
    );
  }

  /**
   * Returns value of the `"Content-Length"` header or `null` if the request
   * does not have a body.
   */
  get contentLength(): number | null {
    const header = this.#headers.get("content-length");
    if (header != null) {
      return Number(header);
    }
    return null;
  }

  /**
   * Returns value of the `"Content-Type"` header without parameters
   * or `null` if the request does not have a body.
   */
  get contentType(): string | null {
    if (this.hasBody) {
      return ContentType.get(this.#headers)?.type.essence ?? null;
    }
    return null;
  }

  is(value: string, ...rest: readonly string[]): string | false {
    if (this.hasBody) {
      return ContentType.get(this.#headers)?.is(value, ...rest) ?? false;
    }
    return false;
  }

  #accept: Accept | null = null;
  #acceptEncoding: AcceptEncoding | null = null;
  #acceptLanguage: AcceptLanguage | null = null;

  #getAccept(): Accept {
    return (this.#accept ??= Accept.tryGet(this.#headers) ?? new Accept("*/*"));
  }

  #getAcceptEncoding(): AcceptEncoding {
    return (this.#acceptEncoding ??=
      AcceptEncoding.tryGet(this.#headers) ?? new AcceptEncoding("*"));
  }

  #getAcceptLanguage(): AcceptLanguage {
    return (this.#acceptLanguage ??=
      AcceptLanguage.tryGet(this.#headers) ?? new AcceptLanguage("*"));
  }

  acceptsType(value: string): boolean {
    return this.#getAccept().accepts(value);
  }

  negotiateType(value: string, ...rest: readonly string[]): string | null {
    return this.#getAccept().negotiate(value, ...rest);
  }

  acceptsEncoding(value: string): boolean {
    return this.#getAcceptEncoding().accepts(value);
  }

  negotiateEncoding(value: string, ...rest: readonly string[]): string | null {
    return this.#getAcceptEncoding().negotiate(value, ...rest);
  }

  acceptsLanguage(value: string): boolean {
    return this.#getAcceptLanguage().accepts(value);
  }

  negotiateLanguage(value: string, ...rest: readonly string[]): string | null {
    return this.#getAcceptLanguage().negotiate(value, ...rest);
  }

  get [Symbol.toStringTag](): string {
    return "Request";
  }
}
