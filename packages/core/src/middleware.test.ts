import test from "ava";
import { type Context } from "./context.js";
import {
  type Handler,
  isHandlerClass,
  isHandlerObject,
  type Next,
} from "./middleware.js";

test("detect handler class and object", (t) => {
  class Handler1 implements Handler {
    async handle(ctx: Context, next: Next): Promise<void> {}
  }

  t.true(isHandlerClass(Handler1));

  t.false(isHandlerClass({}));
  t.false(isHandlerClass(() => {}));
  t.false(isHandlerClass(function () {}));
  t.false(isHandlerClass(class Foo {}));

  t.true(isHandlerObject(new Handler1()));

  t.false(isHandlerObject(() => {}));
  t.false(isHandlerObject(function () {}));
  t.false(isHandlerObject(new (class Foo {})()));
});
