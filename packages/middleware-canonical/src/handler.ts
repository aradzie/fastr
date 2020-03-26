import { type Context, type HandlerObject, type Next } from "@fastr/core";
import { inject, injectable } from "@fastr/invert";
import { canonical } from "./middleware.js";

@injectable()
export class CanonicalHandler implements HandlerObject {
  constructor(@inject("canonicalUrl") canonicalUrl: string) {
    this.handle = canonical(canonicalUrl);
  }

  handle(ctx: Context, next: Next) {}
}
