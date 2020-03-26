import { type Context } from "@fastr/core";
import test from "ava";
import { isPipe, isPipeClass, isPipeObject, type PipeObject } from "./pipe.js";

test("detect pipe class and object", (t) => {
  class Pipe1 implements PipeObject {
    parse(ctx: Context, value: unknown): unknown {
      return null;
    }
  }

  t.true(isPipeClass(Pipe1));

  t.false(isPipeClass({}));
  t.false(isPipeClass(() => {}));
  t.false(isPipeClass(function () {}));
  t.false(isPipeClass(class Foo {}));
  t.false(isPipeClass(null));
  t.false(isPipeClass(undefined));

  t.true(isPipeObject(new Pipe1()));

  t.false(isPipeObject(() => {}));
  t.false(isPipeObject(function () {}));
  t.false(isPipeObject(new (class Foo {})()));
  t.false(isPipeObject(null));
  t.false(isPipeObject(undefined));

  t.true(isPipe(Pipe1.prototype.parse));
  t.true(isPipe(new Pipe1().parse));
  t.true(isPipe(() => {}));
  t.true(isPipe(function () {}));

  t.false(isPipe(Pipe1));
  t.false(isPipe(new Pipe1()));
  t.false(isPipe(null));
  t.false(isPipe(undefined));
});
