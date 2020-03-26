import { type StoredSession } from "@fastr/middleware-session";
import { type File } from "@sosimple/fsx-file";
import { LockFile } from "@sosimple/fsx-lockfile";
import { exponentialDelay } from "@sosimple/retry";

export async function loadSession(file: File): Promise<StoredSession | null> {
  try {
    return (await file.readJson()) as StoredSession;
  } catch {
    return null;
  }
}

export async function storeSession(
  file: File,
  session: StoredSession,
): Promise<void> {
  const json = JSON.stringify(session);
  await LockFile.withLock(
    file,
    {
      retryLimit: 3,
      delayer: exponentialDelay(10),
    },
    async (lock) => {
      await lock.writeFile(json);
    },
  );
}
