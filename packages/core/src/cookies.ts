import {
  Cookie,
  type IncomingHeaders,
  type OutgoingHeaders,
  SetCookie,
  type SetCookieInit,
} from "@fastr/headers";

// TODO check the secure flag

export class Cookies implements SetCookieInit {
  readonly #incoming: IncomingHeaders;
  readonly #outgoing: OutgoingHeaders;
  readonly #cookie: Cookie;
  readonly #setCookie: Map<string, SetCookie>;
  readonly path: string | null;
  readonly domain: string | null;
  readonly maxAge: number | null;
  readonly expires: Date | null;
  readonly sameSite: "Strict" | "Lax" | "None" | null;
  readonly secure: boolean;
  readonly httpOnly: boolean;

  constructor(
    incoming: IncomingHeaders,
    outgoing: OutgoingHeaders,
    {
      path = null,
      domain = null,
      maxAge = null,
      expires = null,
      sameSite = null,
      secure = false,
      httpOnly = false,
    }: Readonly<Cookies.SetCookieOptions> = {},
  ) {
    this.#incoming = incoming;
    this.#outgoing = outgoing;
    this.#cookie = Cookie.tryGet(incoming) ?? new Cookie();
    this.#setCookie = new Map<string, SetCookie>();
    this.path = path;
    this.domain = domain;
    this.maxAge = maxAge;
    this.expires = expires;
    this.sameSite = sameSite;
    this.secure = secure;
    this.httpOnly = httpOnly;
  }

  [Symbol.iterator](): Iterator<[string, string]> {
    return this.#cookie.entries();
  }

  get size(): number {
    return this.#cookie.size;
  }

  keys(): IterableIterator<string> {
    return this.#cookie.keys();
  }

  has(name: string): boolean {
    return this.#cookie.has(name);
  }

  get(name: string): string | null {
    return this.#cookie.get(name);
  }

  /**
   * Sets the cookie value in the response.
   * If the value is `null` the cookie will be deleted
   * by setting an expired date.
   */
  set(
    name: string,
    value: unknown | null,
    {
      path = this.path,
      domain = this.domain,
      maxAge = this.maxAge,
      expires = this.expires,
      sameSite = this.sameSite,
      secure = this.secure,
      httpOnly = this.httpOnly,
    }: Readonly<Cookies.SetCookieOptions> = {},
  ): void {
    if (value != null) {
      value = String(value);
    } else {
      value = "";
      maxAge = null;
      expires = new Date(0);
    }
    this.#setCookie.set(
      name,
      new SetCookie(name, value as string, {
        path,
        domain,
        maxAge,
        expires,
        sameSite,
        secure,
        httpOnly,
      }),
    );
    this.#outgoing.set("set-cookie", [...this.#setCookie.values()]);
  }

  delete(name: string, init: Readonly<Cookies.SetCookieOptions> = {}): void {
    this.set(name, null, init);
  }
}

export namespace Cookies {
  export type SetCookieOptions = SetCookieInit;
}
