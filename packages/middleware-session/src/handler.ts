import { type Context, type Handler, type Next } from "@fastr/core";
import { inject, injectable } from "@fastr/invert";
import { session } from "./middleware.js";
import { type SessionOptions, type SessionState } from "./types.js";

@injectable()
export class SessionHandler implements Handler<SessionState> {
  constructor(@inject("sessionOptions") options: SessionOptions) {
    this.handle = session(options);
  }

  handle(ctx: Context<SessionState>, next: Next) {}
}
