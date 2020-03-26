import { createReadStream, type Stats } from "@sosimple/fsx";
import { createHash } from "crypto";
import { pipeline } from "stream";
import { promisify } from "util";

export interface Tagger {
  (path: string, stats: Stats): Promise<string>;
}

export async function fastTagger(path: string, stats: Stats): Promise<string> {
  const hash = createHash("sha1");
  hash.update(String(stats.ino));
  hash.update(String(stats.size));
  hash.update(String(stats.ctimeMs));
  hash.update(String(stats.mtimeMs));
  return truncate(hash.digest()).toString("hex");
}

export async function preciseTagger(
  path: string,
  stats: Stats,
): Promise<string> {
  const read = createReadStream(path);
  const hash = createHash("sha1");
  await promisify(pipeline)(read, hash);
  read.close();
  return truncate(hash.digest()).toString("hex");
}

function truncate(buffer: Buffer, length = 10) {
  if (buffer.length < length) {
    throw new Error();
  }
  const result = Buffer.alloc(length);
  for (let i = 0; i < buffer.length; i++) {
    result.writeUInt8(
      result.readUInt8(i % length) ^ buffer.readUInt8(i),
      i % length,
    );
  }
  return result;
}
