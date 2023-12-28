import crypto from "crypto";
import { createReadStream, type PathLike, stat, type Stats } from "fs";
import { type Readable } from "stream";
import { promisify } from "util";

const statAsync = promisify(stat);

/**
 * Streamable is a class which can open readable streams.
 */
export abstract class Streamable {
  /**
   * Tests if the given value is a streamable instance.
   */
  static isStreamable(value: unknown): value is Streamable {
    return value instanceof Streamable;
  }

  /**
   * Creates and returns a new streamable for the specified file path.
   */
  static fromFile(path: PathLike): Promise<FileStreamable> {
    return FileStreamable.create(path);
  }

  /**
   * Gets readable stream length in bytes, if known.
   */
  abstract length(): number | null;

  /**
   * Opens new readable stream.
   */
  abstract open(): Readable;

  get [Symbol.toStringTag](): string {
    return "Streamable";
  }
}

/**
 * A streamable which opens files for reading.
 */
export class FileStreamable extends Streamable {
  /**
   * Creates file streamable for the given path.
   */
  static async create(path: PathLike): Promise<FileStreamable> {
    return new FileStreamable(path, await statAsync(path));
  }

  readonly etag: string;

  private constructor(
    readonly path: PathLike,
    readonly stats: Stats,
  ) {
    super();
    if (!stats.isFile()) {
      throw new TypeError(`Not a file: ${path}`);
    }
    this.etag = etag(stats);
  }

  override length(): number | null {
    return this.stats.size;
  }

  override open(): Readable {
    return createReadStream(this.path);
  }

  override get [Symbol.toStringTag](): string {
    return "FileStreamable";
  }
}

export function etag(stats: Stats): string {
  const hash = crypto.createHash("md5");
  hash.update(String(stats.size));
  hash.update(String(stats.mtimeMs));
  return hash.digest("hex");
}
