import { type Context } from "@fastr/core";
import { type RouterState } from "@fastr/middleware-router";
import test from "ava";
import { isPipeClass, isPipeObject, type Pipe } from "./pipe.js";

test("detect pipe class", (t) => {
  class Pipe1 implements Pipe {
    transform(ctx: Context<RouterState>, value: string): unknown {
      return null;
    }
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
