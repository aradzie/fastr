import { Store } from "./store";
import { decode, encode, randomString } from "./util";

export interface Options {
  /**
   * The store which keeps session data.
   */
  readonly store?: Store | "cookie";
  /**
   * A function which generates unique session ids.
   */
  readonly generateId?: () => string;
  /**
   * A function which serializes session data to cookie value.
   */
  readonly encode?: (value: any) => string;
  /**
   * A function which deserializes session data from cookie value.
   */
  readonly decode?: (value: string) => any;
  /**
   * Whether to automatically start session.
   */
  readonly autoStart?: boolean;
  /**
   * Session cookie name.
   *
   * The default is "session".
   */
  readonly key?: string;
  /**
   * A boolean indicating whether session expiration is rolling.
   *
   * The default is true.
   */
  readonly rolling?: boolean;
  /**
   * A number indicating the session max age in seconds.
   *
   * The default is one day.
   */
  readonly maxAge?: number | "session";
  /**
   * A string indicating the domain of the cookie.
   *
   * No default value.
   */
  readonly domain?: string;
  /**
   * A string indicating the path of the cookie.
   *
   * The default is "/".
   */
  readonly path?: string;
  /**
   * A boolean indicating whether the cookie is only to be sent over HTTP(S),
   * and not made available to client JavaScript.
   *
   * The default is true.
   */
  readonly httpOnly?: boolean;
  /**
   * A boolean indicating whether the cookie is only to be sent
   * over HTTPS (false by default for HTTP, true by default for HTTPS).
   */
  readonly secure?: boolean;
  /**
   * A boolean or string indicating whether the cookie is a "same site" cookie.
   *
   * This can be set to "strict", "lax", or true (which maps to "strict").
   *
   * The default is false.
   */
  readonly sameSite?: "strict" | "lax" | "none" | boolean;
  /**
   * A boolean indicating whether the cookie is to be signed.
   *
   * The default is false.
   */
  readonly signed?: boolean;
}

export interface ParsedOptions {
  readonly store: Store | "cookie";
  readonly generateId: () => string;
  readonly encode: (value: any) => string;
  readonly decode: (value: string) => any;
  readonly autoStart: boolean;
  readonly key: string;
  readonly rolling: boolean;
  readonly maxAge: number | "session";
  readonly domain?: string;
  readonly path?: string;
  readonly httpOnly?: boolean;
  readonly secure?: boolean;
  readonly sameSite?: "strict" | "lax" | "none" | boolean;
  readonly signed: boolean;
}

export function parseOptions(options: Options): ParsedOptions {
  return {
    store: "cookie",
    generateId: () => randomString(20),
    encode: encode,
    decode: decode,
    autoStart: false,
    key: "session",
    rolling: true,
    maxAge: 86400, // One day in seconds.
    signed: false,
    ...options,
  };
}
