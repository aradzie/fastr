import { mkdir, removeDir } from "@sosimple/fsx";
import test, { registerCompletionHandler } from "ava";
import { FileStore } from "./filestore.js";

registerCompletionHandler(() => {
  process.exit();
});

const directory = "/tmp/wfx-session-test";

test.beforeEach(async (t) => {
  await removeDir(directory);
  await mkdir(directory, { recursive: true });
});

test.afterEach(async (t) => {
  await removeDir(directory);
});

test.serial("create new session file", async (t) => {
  // Arrange.

  const store = new FileStore({ directory });
  const file = store.sessionFile("session_id");

  // Act.

  await store.store("session_id", {
    expires: null,
    data: { key: "value" },
  });

  // Assert.

  t.deepEqual(await file.readJson(), {
    expires: null,
    data: { key: "value" },
  });
});

test.serial("overwrite existing session file", async (t) => {
  // Arrange.

  const store = new FileStore({ directory });
  const file = store.sessionFile("session_id");
  await file.writeJson({ key: "overwrite me" });

  // Act.

  await store.store("session_id", {
    expires: null,
    data: { key: "value" },
  });

  // Assert.

  t.deepEqual(await file.readJson(), {
    expires: null,
    data: { key: "value" },
  });
});

test.serial("save empty session data", async (t) => {
  // Arrange.

  const store = new FileStore({ directory });
  const file = store.sessionFile("session_id");
  await file.writeJson({ key: "overwrite me" });

  // Act.

  await store.store("session_id", {
    expires: null,
    data: {},
  });

  // Assert.

  t.deepEqual(await file.readJson(), {
    expires: null,
    data: {},
  });
});

test.serial("read missing session file", async (t) => {
  // Arrange.

  const store = new FileStore({ directory });

  // Act.

  const data = await store.load("session_id");

  // Assert.

  t.is(data, null);
});

test.serial("read existing session file", async (t) => {
  // Arrange.

  const store = new FileStore({ directory });
  const file = store.sessionFile("session_id");
  await file.writeJson({
    expires: null,
    data: { key: "value" },
  });

  // Act.

  const data = await store.load("session_id");

  // Assert.

  t.deepEqual(data, {
    expires: null,
    data: { key: "value" },
  });
});

test.serial("ignore invalid session file", async (t) => {
  // Arrange.

  const store = new FileStore({ directory });
  const file = store.sessionFile("session_id");
  await file.write("not a valid json");

  // Act.

  const data = await store.load("session_id");

  // Assert.

  t.is(data, null);
  t.true(await file.exists());
});

test.serial("destroy missing session file", async (t) => {
  // Arrange.

  const store = new FileStore({ directory });
  const file = store.sessionFile("session_id");

  // Act.

  await store.destroy("session_id");

  // Assert.

  t.false(await file.exists());
});

test.serial("destroy existing session file", async (t) => {
  // Arrange.

  const store = new FileStore({ directory });
  const file = store.sessionFile("session_id");
  await file.write("dummy");

  // Act.

  await store.destroy("session_id");

  // Assert.

  t.false(await file.exists());
});

test.serial("list files", async (t) => {
  // Arrange.

  const store = new FileStore({ directory });

  // Assert.

  t.deepEqual(
    (await collect(store.listFiles())).map(({ file }) => file.name),
    [],
  );

  // Act.

  await store.store("00X", {
    expires: null,
    data: { key: "value" },
  });
  await store.store("01X", {
    expires: null,
    data: { key: "value" },
  });

  // Assert.

  t.deepEqual(
    (await collect(store.listFiles())).map(({ file }) => file.name),
    ["/tmp/wfx-session-test/00/X", "/tmp/wfx-session-test/01/X"],
  );
});

async function collect<T>(it: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of it) {
    result.push(item);
  }
  return result;
}
