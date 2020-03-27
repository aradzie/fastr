import { createReadStream, PathLike, stat } from "fs";
import { Readable } from "stream";
import { promisify } from "util";

const statAsync = promisify(stat);

export abstract class Streamable {
  /**
   * Tests if the given value is a streamable instance.
   */
  static isStreamable(value: any): value is Streamable {
    return value instanceof Streamable || typeof value.open === "function";
  }

  /**
   * Gets readable stream length in bytes, if known.
   */
  abstract length(): Promise<number | null>;

  /**
   * Opens new readable stream.
   */
  abstract open(): Readable;

  get [Symbol.toStringTag](): string {
    return "Streamable";
  }
}

export class FileStreamable extends Streamable {
  constructor(readonly path: PathLike) {
    super();
  }

  async length(): Promise<number | null> {
    return (await statAsync(this.path)).size;
  }

  open(): Readable {
    return createReadStream(this.path);
  }

  get [Symbol.toStringTag](): string {
    return "FileStreamable";
  }
}
