import { type Store } from "./store.js";

export interface SessionState {
  session: Session;
}

export interface SessionTypes {
  [key: string]: any;
}

export interface Session<Types = SessionTypes> {
  /**
   * Session id, or null if not started.
   */
  readonly id: string | null;

  /**
   * Whether the session has been started already.
   */
  readonly started: boolean;

  /**
   * Whether the session is new, i.e. started in the current request.
   */
  readonly isNew: boolean;

  /**
   * Session expiration date, or null if session expires when the user browser is closed.
   */
  readonly expires: Date | null;

  /**
   * Starts new session if not already started.
   */
  start(): void;

  /**
   * Destroys current session, if any.
   */
  destroy(): void;

  /**
   * Generates new session id. Session must be started.
   */
  regenerate(): void;

  /**
   * Change session expiration date.
   */
  touch(): void;

  entries(): IterableIterator<[string, any]>;

  has(key: string): boolean;

  get<T extends keyof Types>(key: T, defaultValue: Types[T]): Types[T];

  get<T extends keyof Types>(key: T): Types[T] | null;

  pull<T extends keyof Types>(key: T, defaultValue: Types[T]): T;

  pull<T extends keyof Types>(key: T): Types[T] | null;

  set(entries: Partial<Types>): void;

  set<T extends keyof Types>(key: T, value: Types[T]): void;

  delete(key: string): void;

  clear(): void;

  toJSON(): Partial<Types>;
}

export interface SessionOptions {
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
   * This can be set to "Strict", "Lax", "None" or null.
   *
   * The default is false.
   */
  readonly sameSite?: "Strict" | "Lax" | "None" | null;
}
