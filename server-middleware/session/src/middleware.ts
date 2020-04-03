import Koa from "koa";
import { Adapter } from "./adapter";
import { Cookie } from "./adapter/cookie";
import { External } from "./adapter/external";
import { Options, ParsedOptions, parseOptions } from "./options";
import { Session } from "./session";

export function session(app: Koa, options: Options): Koa.Middleware {
  return sessionImpl(app, parseOptions(options));
}

function sessionImpl(app: Koa, options: ParsedOptions): Koa.Middleware {
  const session = async (
    ctx: Koa.ExtendableContext,
    next: Koa.Next,
  ): Promise<void> => {
    const adapter = makeAdapter(ctx);
    await adapter.load();
    if (options.autoStart) {
      adapter.start();
    }
    ctx.session = new Session(adapter);
    await next();
    await adapter.commit();
  };
  Object.defineProperty(session, "name", {
    value: "session",
  });
  return session;

  function makeAdapter({ cookies }: Koa.ExtendableContext): Adapter {
    if (options.store === "cookie") {
      return new Cookie(cookies, options);
    } else {
      return new External(cookies, options);
    }
  }
}
