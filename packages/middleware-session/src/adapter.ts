import { type Cookies } from "@fastr/core";
import { sha1 } from "object-hash";
import { type ParsedOptions } from "./options.js";
import { now } from "./util.js";

export abstract class Adapter<CookieData = unknown> {
  /**
   * An id of the session that we started with, if any.
   */
  oldId: string | null = null;

  /**
   * An id of the current session id, if any.
   */
  id: string | null = null;

  /**
   * Expiration timestamp that we started with, if any.
   */
  oldExpires: number | null = null;

  /**
   * Current expiration timestamp, if any.
   */
  expires: number | null = null;

  /**
   * Session data.
   */
  readonly data = new Map<string, any>();

  /**
   * Hash of the initial session data for change tracking.
   */
  #hash = "";

  constructor(readonly cookies: Cookies, readonly options: ParsedOptions) {}

  /**
   * Starts new session if not already started.
   */
  start(): void {
    if (this.id == null) {
      this.regenerate();
    }
  }

  /**
   * Destroys the current session, if any.
   */
  destroy(): void {
    this.id = null;
    this.expires = null;
    this.data.clear();
  }

  /**
   * Regenerates session id.
   */
  regenerate(): void {
    this.id = this.options.generateId();
    this.touch();
  }

  /**
   * Extends session expiration time.
   */
  touch(): void {
    const { maxAge } = this.options;
    if (maxAge === "session") {
      this.expires = null;
    } else {
      this.expires = now() + maxAge;
    }
  }

  init(
    id: string | null,
    expires: number | null,
    data: Record<string, unknown>,
  ): void {
    const { rolling, maxAge } = this.options;
    this.oldId = id;
    this.id = id;
    this.oldExpires = expires;
    if (maxAge === "session") {
      this.expires = null;
    } else if (rolling) {
      this.expires = now() + maxAge;
    } else {
      this.expires = expires;
    }
    this.data.clear();
    for (const [key, value] of Object.entries(data)) {
      this.data.set(key, value);
    }
    this.#hash = sha1(this.data);
  }

  get changed(): boolean {
    return this.#hash !== sha1(this.data);
  }

  /**
   * Parses cookie and loads session data from store.
   */
  abstract load(): Promise<void>;

  /**
   * Saves sessions data to store and sends cookie.
   */
  abstract commit(): Promise<void>;

  protected getCookie(): CookieData | null {
    const { key } = this.options;
    const cookie = this.cookies.get(key) || null;
    if (cookie != null) {
      return this.parseCookie(cookie);
    } else {
      return null;
    }
  }

  protected setCookie(data: CookieData | null, expires: number | null): void {
    const { key } = this.options;
    const init: Cookies.SetCookieOptions = {
      domain: this.options.domain,
      path: this.options.path,
      httpOnly: this.options.httpOnly,
      secure: this.options.secure,
      sameSite: this.options.sameSite,
    };
    if (data != null) {
      if (expires != null) {
        init.expires = new Date(expires * 1000);
      }
      this.cookies.set(key, this.stringifyCookie(data), init);
    } else {
      this.cookies.delete(key, init);
    }
  }

  protected abstract parseCookie(val: string): CookieData | null;

  protected abstract stringifyCookie(data: CookieData): string;
}
