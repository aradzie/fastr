import { scanDir, Stats } from "@aradzie/fsx";
import { File } from "@aradzie/fsx-file";
import { LockFile } from "@aradzie/fsx-lockfile";
import { exponentialDelay, RetryOptions } from "@aradzie/retry";
import { Store, StoredSession } from "@webfx-middleware/session";
import { inject, injectable } from "inversify";
import { join } from "path";

export const kFileStoreOptions = Symbol("kFileStoreOptions");

export interface Options {
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

  constructor(@inject(kFileStoreOptions) options: Options) {
    const { directory } = options;
    this.directory = directory;
  }

  async load(sessionId: string): Promise<StoredSession | null> {
    return await load(this.sessionFile(sessionId));
  }

  async store(sessionId: string, session: StoredSession): Promise<void> {
    await store(this.sessionFile(sessionId), session);
  }

  async destroy(sessionId: string): Promise<void> {
    await this.sessionFile(sessionId).delete();
  }

  sessionFile(sessionId: string): File {
    if (sessionId == "" || sessionId.includes("/")) {
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
        const session = await load(file);
        if (session != null) {
          yield { file, stats, session };
        }
      }
    }
  }
}

async function load(file: File): Promise<StoredSession | null> {
  try {
    return (await file.readJson()) as StoredSession;
  } catch {
    return null;
  }
}

async function store(file: File, session: StoredSession) {
  const options: RetryOptions = {
    retryLimit: 3,
    delayer: exponentialDelay(10),
  };
  const json = JSON.stringify(session);
  await LockFile.withLock(file, options, async (lock) => {
    await lock.writeFile(json);
  });
}
