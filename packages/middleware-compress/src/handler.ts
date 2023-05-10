import { type Context, type Handler, type Next } from "@fastr/core";
import { inject, injectable } from "@fastr/invert";
import { compress, type CompressOptions } from "./middleware.js";

@injectable()
export class CompressHandler implements Handler {
  constructor(@inject("compressOptions") options: CompressOptions) {
    this.handle = compress(options);
  }

  handle(ctx: Context, next: Next) {}
}
