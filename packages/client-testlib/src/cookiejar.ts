import { type SetCookie } from "@fastr/headers";

export class CookieJar implements Iterable<[string, string]> {
  readonly #data = new Map<string, Entry>();

  clear(): void {
    this.#data.clear();
  }

  addAll(cookies: Iterable<SetCookie>): void {
    for (const cookie of cookies) {
      this.add(cookie);
    }
  }

  add(cookie: SetCookie): void {
    const { name, maxAge, expires } = cookie;
    if (maxAge != null && maxAge <= 0) {
      this.#data.delete(name);
      return;
    }
    if (expires != null && expires.getTime() < Date.now()) {
      this.#data.delete(name);
      return;
    }
    this.#data.set(name, new Entry(cookie));
    return;
  }

  get(name: string): string | null {
    const entry = this.#data.get(name);
    if (entry == null || entry.expired()) {
      return null;
    } else {
      return entry.value;
    }
  }

  *[Symbol.iterator](): Iterator<[string, string]> {
    for (const entry of this.#data.values()) {
      if (!entry.expired()) {
        yield [entry.name, entry.value];
      }
    }
  }
}

class Entry {
  readonly name: string;
  readonly value: string;
  readonly expires: Date | null;

  constructor({ name, value, maxAge, expires }: SetCookie) {
    // https://www.rfc-editor.org/rfc/rfc6265#section-4.1.2.2
    // If a cookie has both the Max-Age and the Expires attribute, the Max-Age
    // attribute has precedence and controls the expiration date of the cookie.
    if (maxAge != null) {
      expires = new Date(Date.now() + maxAge * 1000);
    }
    this.name = name;
    this.value = value;
    this.expires = expires;
  }

  expired(now: number = Date.now()): boolean {
    return this.expires != null && this.expires.getTime() < now;
  }
}
