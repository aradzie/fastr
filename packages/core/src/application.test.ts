import test from "ava";
import { Application } from "./application.js";
import { type Context } from "./context.js";
import { type Handler, type Next } from "./middleware.js";

test("use middleware", (t) => {
  class CustomHandler implements Handler {
    handle(ctx: Context, next: Next) {
      return next();
    }
  }

  const app = new Application();

  app.use(CustomHandler);
  app.use(new CustomHandler());
  app.use((ctx) => {});

  const callback = app.callback();

  t.is(typeof callback, "function");
});
