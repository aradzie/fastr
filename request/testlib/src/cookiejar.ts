import { Cookie, SetCookie } from "@webfx-http/headers";

export class CookieJar implements Iterable<Cookie> {
  readonly #data = new Map<string, Entry>();
  readonly domain: string;
  readonly path: string;

  constructor({
    domain = ".",
    path = "/",
  }: {
    readonly domain?: string;
    readonly path?: string;
  } = {}) {
    this.domain = domain;
    this.path = path;
  }

  clear(): void {
    this.#data.clear();
  }

  addAll(cookies: Iterable<SetCookie>): void {
    for (const cookie of cookies) {
      this.add(cookie);
    }
  }

  add(cookie: SetCookie): void {
    const { name, value, maxAge, expires } = cookie;
    if (maxAge != null && maxAge <= 0) {
      this.#data.delete(name);
      return;
    }
    if (expires != null && expires.getTime() < Date.now()) {
      this.#data.delete(name);
      return;
    }
    if (value === "") {
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

  *[Symbol.iterator](): Iterator<Cookie> {
    for (const entry of this.#data.values()) {
      if (!entry.expired()) {
        yield new Cookie(entry.name, entry.value);
      }
    }
  }
}

class Entry {
  readonly name: string;
  readonly value: string;
  readonly expires: Date | null;

  constructor({ name, value, maxAge, expires }: SetCookie) {
    if (expires == null && maxAge != null) {
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
