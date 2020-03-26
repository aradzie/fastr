import { type Context, type HandlerObject, type Next } from "@fastr/core";
import test from "ava";
import { getControllerUse, getHandlerUse } from "../impl/metadata.js";
import { controller } from "./controller.js";
import { use } from "./middleware.js";

function middleware1(ctx: Context, next: Next): Promise<void> {
  return next();
}

class Handler1 implements HandlerObject {
  handle(ctx: Context, next: Next): Promise<void> {
    return next();
  }
}

test("get use middleware metadata on controller", (t) => {
  @controller()
  @use(middleware1)
  @use(Handler1)
  class Controller1 {}

  t.deepEqual(getControllerUse(Controller1), [middleware1, Handler1]);
});

test("get use middleware metadata on handler", (t) => {
  @controller()
  class Controller1 {
    @use(middleware1)
    @use(Handler1)
    index() {}
  }

  t.deepEqual(getHandlerUse(Controller1.prototype, "index"), [
    middleware1,
    Handler1,
  ]);
});
