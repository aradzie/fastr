import { injectable } from "inversify";
import type { Store, StoredSession } from "../store.js";

@injectable()
export class TransientStore implements Store {
  readonly sessions = new Map<string, StoredSession>();

  async load(sessionId: string): Promise<StoredSession | null> {
    const session = this.sessions.get(sessionId);
    if (session != null) {
      const { expires, data } = session;
      return {
        expires,
        data: clone(data),
      };
    } else {
      return null;
    }
  }

  async store(
    sessionId: string,
    { expires, data }: StoredSession,
  ): Promise<void> {
    this.sessions.set(sessionId, {
      expires,
      data: clone(data),
    });
  }

  async destroy(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}

function clone(data: any): any {
  return JSON.parse(JSON.stringify(data));
}
