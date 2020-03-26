declare module "koa" {
  interface ExtendableContext {
    session: Session;
  }
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
