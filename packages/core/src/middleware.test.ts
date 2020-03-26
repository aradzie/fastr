import test from "ava";
import { type Context } from "./context.js";
import {
  type HandlerObject,
  isHandlerClass,
  isHandlerObject,
  isMiddleware,
  type Next,
} from "./middleware.js";

test("detect handler class and object", (t) => {
  class Handler1 implements HandlerObject {
    handle(ctx: Context, next: Next): void {}
  }

  t.true(isHandlerClass(Handler1));

  t.false(isHandlerClass({}));
  t.false(isHandlerClass(() => {}));
  t.false(isHandlerClass(function () {}));
  t.false(isHandlerClass(class Foo {}));
  t.false(isHandlerClass(null));
  t.false(isHandlerClass(undefined));

  t.true(isHandlerObject(new Handler1()));

  t.false(isHandlerObject(() => {}));
  t.false(isHandlerObject(function () {}));
  t.false(isHandlerObject(new (class Foo {})()));
  t.false(isHandlerObject(null));
  t.false(isHandlerObject(undefined));

  t.true(isMiddleware(Handler1.prototype.handle));
  t.true(isMiddleware(new Handler1().handle));
  t.true(isMiddleware(() => {}));
  t.true(isMiddleware(function () {}));

  t.false(isMiddleware(Handler1));
  t.false(isMiddleware(new Handler1()));
  t.false(isMiddleware(null));
  t.false(isMiddleware(undefined));
});
