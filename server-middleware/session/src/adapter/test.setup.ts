import Koa from "koa";
import supertest from "supertest";
import { session } from "../middleware";
import { Options } from "../options";
import { Session } from "../types";

type SessionTypes = { count: number };

export class Setup {
  readonly app = new Koa();
  readonly agent = supertest.agent(this.app.listen());

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

  handle(session: Session<SessionTypes>): void {
    session.set("count", (session.get("count") ?? 0) + 1);
  }
}
