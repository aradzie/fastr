import { request } from "@fastr/client";
import { CookieJar, cookies, start } from "@fastr/client-testlib";
import { Application } from "@fastr/core";
import { session } from "../../middleware.js";
import { type Session, type SessionOptions } from "../../types.js";

type SessionTypes = { count: number };

export class Helper {
  readonly app = new Application();
  readonly request = request
    .use(start(this.app.callback()))
    .use(cookies(new CookieJar()));

  constructor(options: SessionOptions) {
    this.app.use(
      session({
        generateId: (() => {
          let id = 1;
          return () => `id${id++}`;
        })(),
        maxAge: 3600,
        ...options,
      }),
    );

    this.app.use((ctx) => {
      const session = ctx.state.session as Session<SessionTypes>;
      this.handle(session);
      if (session.started) {
        ctx.response.body = {
          id: session.id,
          isNew: session.isNew,
          expires: session.expires,
          data: session.toJSON(),
        };
      } else {
        ctx.response.body = {};
      }
    });
  }

  handle = (session: Session<SessionTypes>): void => {
    session.set("count", (session.get("count") ?? 0) + 1);
  };
}
