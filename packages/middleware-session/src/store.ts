export interface StoredSession {
  readonly expires: number | null;
  readonly data: Record<string, unknown>;
}

export interface Store {
  load(sessionId: string): Promise<StoredSession | null>;

  store(sessionId: string, session: StoredSession): Promise<void>;

  destroy(sessionId: string): Promise<void>;
}
