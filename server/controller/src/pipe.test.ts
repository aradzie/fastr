import type { RouterContext } from "@webfx-middleware/router";
import test from "ava";
import { IPipe, isPipeClass, isPipeObject } from "./pipe.js";

test("should detect pipe class", (t) => {
  class Pipe1 implements IPipe {
    transform(ctx: RouterContext, value: string) {}
  }

  t.true(isPipeClass(Pipe1));

  t.false(isPipeClass({}));
  t.false(isPipeClass(() => {}));
  t.false(isPipeClass(function () {}));
  t.false(isPipeClass(class Foo {}));

  t.true(isPipeObject(new Pipe1()));
  t.false(isPipeObject(() => {}));
  t.false(isPipeObject(function () {}));
  t.false(isPipeObject(new (class Foo {})()));
});
