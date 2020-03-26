import Cookies from "cookies";
import { sha1 } from "object-hash";
import { ParsedOptions } from "./options";
import { now } from "./util";

export abstract class Adapter<CookieData = {}> {
  private readonly cookies: Cookies;
  private readonly getOption: Readonly<Cookies.GetOption>;
  private readonly setOption: Readonly<Cookies.SetOption>;

  readonly options: ParsedOptions;

  /**
   * Id of the session that we started with, if any.
   */
  oldId: string | null = null;

  /**
   * Current session id, if any.
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
  private hash: string = "";

  constructor(cookies: Cookies, options: ParsedOptions) {
    this.cookies = cookies;
    const { domain, path, httpOnly, secure, sameSite, signed } = options;
    this.getOption = {
      signed,
    };
    this.setOption = {
      domain,
      path,
      httpOnly,
      secure,
      sameSite,
      signed,
      overwrite: true,
    };
    this.options = options;
  }

  /**
   * Starts new session if not already started.
   */
  start() {
    if (this.id == null) {
      this.regenerate();
    }
  }

  /**
   * Destroys the current session, if any.
   */
  destroy() {
    this.id = null;
    this.expires = null;
    this.data.clear();
  }

  /**
   * Regenerates session id.
   */
  regenerate() {
    this.id = this.options.generateId();
    this.touch();
  }

  /**
   * Extends session expiration time.
   */
  touch() {
    const { maxAge } = this.options;
    if (maxAge == "session") {
      this.expires = null;
    } else {
      this.expires = now() + maxAge;
    }
  }

  init(id: string | null, expires: number | null, data: {}) {
    const { rolling, maxAge } = this.options;
    this.oldId = id;
    this.id = id;
    this.oldExpires = expires;
    if (maxAge == "session") {
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
    this.hash = sha1(this.data);
  }

  get changed() {
    return this.hash != sha1(this.data);
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
    const cookie = this.cookies.get(key, this.getOption) || null;
    if (cookie != null) {
      return this.parseCookie(cookie);
    } else {
      return null;
    }
  }

  protected setCookie(data: CookieData | null, expires: number | null) {
    const { key } = this.options;
    const setOption = { ...this.setOption };
    if (data != null) {
      const val = this.stringifyCookie(data);
      if (expires != null) {
        setOption.expires = new Date(expires * 1000);
      }
      this.cookies.set(key, val, setOption);
    } else {
      setOption.expires = new Date(0);
      this.cookies.set(key, "", setOption);
    }
  }

  protected abstract parseCookie(val: string): CookieData | null;

  protected abstract stringifyCookie(data: CookieData): string;
}
