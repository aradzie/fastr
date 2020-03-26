import { inject, injectable } from "@fastr/invert";
import { type Store, type StoredSession } from "@fastr/middleware-session";
import { scanDir, type Stats } from "@sosimple/fsx";
import { File } from "@sosimple/fsx-file";
import { join } from "path";
import { loadSession, storeSession } from "./io.js";

export const kFileStoreOptions = Symbol("kFileStoreOptions");

export interface FileStoreOptions {
  readonly directory: string;
}

export interface SessionFile {
  readonly file: File;
  readonly stats: Stats;
  readonly session: StoredSession;
}

@injectable()
export class FileStore implements Store {
  private readonly directory: string;

  constructor(@inject(kFileStoreOptions) options: FileStoreOptions) {
    const { directory } = options;
    this.directory = directory;
  }

  async load(sessionId: string): Promise<StoredSession | null> {
    return await loadSession(this.sessionFile(sessionId));
  }

  async store(sessionId: string, session: StoredSession): Promise<void> {
    await storeSession(this.sessionFile(sessionId), session);
  }

  async destroy(sessionId: string): Promise<void> {
    await this.sessionFile(sessionId).delete();
  }

  sessionFile(sessionId: string): File {
    if (sessionId === "" || sessionId.includes("/")) {
      throw new Error("Invalid session id");
    }
    return new File(
      sessionId.length > 2
        ? join(
            this.directory,
            sessionId.substring(0, 2),
            sessionId.substring(2),
          )
        : join(this.directory, sessionId),
    );
  }

  async *listFiles(): AsyncIterable<SessionFile> {
    for await (const { path, stats } of scanDir(this.directory)) {
      if (stats.isFile()) {
        const file = new File(join(this.directory, path));
        const session = await loadSession(file);
        if (session != null) {
          yield { file, stats, session };
        }
      }
    }
  }
}
