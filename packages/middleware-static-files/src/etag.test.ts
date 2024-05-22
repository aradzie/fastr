import { join } from "node:path";
import { mkdir, removeDir, stat, type Stats, writeFile } from "@sosimple/fsx";
import test from "ava";
import { fastTagger, preciseTagger } from "./etag.js";

const dir = "/tmp/static-files-etag/";
const path1 = join(dir, "file1.txt");
const path2 = join(dir, "file2.txt");

test.before(async (t) => {
  await mkdir(dir, { recursive: true });
  await writeFile(path1, "content1");
  await writeFile(path2, "content2");
});

test.after(async (t) => {
  await removeDir(dir);
});

test("fast tagger", async (t) => {
  const stats = { ino: 1, size: 2, ctimeMs: 3, mtimeMs: 4 } as Stats;
  const etag = await fastTagger("/path", stats);

  t.regex(etag, /^[a-zA-Z0-9]{10,}$/);
  t.is(etag, await fastTagger("/another/path", stats));
  t.not(
    etag,
    await fastTagger("/path", {
      ...stats,
      ino: 999,
    }),
  );
  t.not(
    etag,
    await fastTagger("/path", {
      ...stats,
      size: 999,
    }),
  );
  t.not(
    etag,
    await fastTagger("/path", {
      ...stats,
      ctimeMs: 999,
    }),
  );
  t.not(
    etag,
    await fastTagger("/path", {
      ...stats,
      mtimeMs: 999,
    }),
  );
});

test("precise tagger", async (t) => {
  const etag1 = await preciseTagger(path1, await stat(path1));
  const etag2 = await preciseTagger(path2, await stat(path2));

  t.not(etag1, etag2);
  t.is(etag1, await preciseTagger(path1, await stat(path1)));
  t.is(etag2, await preciseTagger(path2, await stat(path2)));
});
