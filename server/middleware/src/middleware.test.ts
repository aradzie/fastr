import test from "ava";
import Koa from "koa";
import {
  IMiddleware,
  isMiddlewareClass,
  isMiddlewareObject,
} from "./middleware";

test("detect middleware class and object", (t) => {
  class Middleware1 implements IMiddleware {
    handle(ctx: Koa.Context, next: Koa.Next) {}
  }

  t.true(isMiddlewareClass(Middleware1));

  t.false(isMiddlewareClass({}));
  t.false(isMiddlewareClass(() => {}));
  t.false(isMiddlewareClass(function() {}));
  t.false(isMiddlewareClass(class Foo {}));

  t.true(isMiddlewareObject(new Middleware1()));
  t.false(isMiddlewareObject(() => {}));
  t.false(isMiddlewareObject(function() {}));
  t.false(isMiddlewareObject(new (class Foo {})()));
});
