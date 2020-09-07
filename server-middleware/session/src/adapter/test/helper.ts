import { request } from "@webfx-request/node";
import { CookieJar, cookies, start } from "@webfx-request/testlib";
import Koa from "koa";
import { session } from "../../middleware";
import type { Options } from "../../options";
import type { Session } from "../../types";

type SessionTypes = { count: number };

export class Helper {
  readonly app = new Koa();
  readonly request = request
    .use(start(this.app.listen()))
    .use(cookies(new CookieJar()));

  constructor(options: Options) {
    this.app.use(
      session(this.app, {
        generateId: (() => {
          let id = 1;
          return () => `id${id++}`;
        })(),
        maxAge: 3600,
        ...options,
      }),
    );

    this.app.use((ctx) => {
      const session = ctx.session as Session<SessionTypes>;
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
