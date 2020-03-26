import { type Context, type Middleware, type Next } from "@fastr/core";
import { type Adapter } from "./adapter.js";
import { Cookie } from "./adapter/cookie.js";
import { External } from "./adapter/external.js";
import { parseOptions } from "./options.js";
import { Session } from "./session.js";
import { type SessionOptions, type SessionState } from "./types.js";

export function session<StateT = unknown>(
  options: SessionOptions,
): Middleware<StateT & SessionState> {
  const opts = parseOptions(options);

  return async (ctx: Context<SessionState>, next: Next): Promise<void> => {
    const adapter = makeAdapter(ctx);
    await adapter.load();
    if (opts.autoStart) {
      adapter.start();
    }
    const session = new Session(adapter);
    ctx.container.bind(Session).toValue(session);
    ctx.state.session = session;
    await next();
    await adapter.commit();
  };

  function makeAdapter(ctx: Context): Adapter {
    if (opts.store === "cookie") {
      return new Cookie(ctx.cookies, opts);
    } else {
      return new External(ctx.cookies, opts);
    }
  }
}
