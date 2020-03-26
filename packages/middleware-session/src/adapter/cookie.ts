import { type Cookies } from "@fastr/core";
import { Adapter } from "../adapter.js";
import { type ParsedOptions } from "../options.js";

const kId = "@i";
const kExpires = "@e";

/**
 * Serialized cookie content which includes all session data.
 */
interface CookieData {
  /** Other session values. */
  [key: string]: any;

  /** Session id. */
  [kId]: string;

  /** Session expiration timestamp in seconds. */
  [kExpires]: number | null;
}

/**
 * The adapter which keeps all session data in cookies.
 */
export class Cookie extends Adapter<CookieData> {
  private readonly encode: (value: any) => string;
  private readonly decode: (value: string) => any;

  constructor(cookies: Cookies, options: ParsedOptions) {
    super(cookies, options);
    const { store } = options;
    if (store !== "cookie") {
      throw new TypeError();
    }
    this.encode = options.encode;
    this.decode = options.decode;
  }

  async load(): Promise<void> {
    const value = this.getCookie();
    if (value == null) {
      return;
    }

    const { [kId]: id, [kExpires]: expires, ...data } = value;

    this.init(id, expires, data);
  }

  async commit(): Promise<void> {
    const { oldId, id, oldExpires, expires, changed } = this;
    if (id == null) {
      if (oldId != null) {
        this.setCookie(null, null);
      }
    } else {
      if (oldId !== id || oldExpires !== expires || changed) {
        const data = Object.fromEntries(this.data);
        this.setCookie(
          {
            ...data,
            [kId]: id,
            [kExpires]: expires,
          },
          expires,
        );
      }
    }
  }

  protected parseCookie(val: string): CookieData | null {
    try {
      const data = this.decode(val);
      if (typeof data === "object") {
        const { [kId]: id, [kExpires]: expires } = data;
        if (
          typeof id === "string" &&
          (typeof expires === "number" || expires == null)
        ) {
          return data as CookieData;
        }
      }
    } catch {
      /* Ignore. */
    }
    return null;
  }

  protected stringifyCookie(data: CookieData): string {
    return this.encode(data);
  }
}
