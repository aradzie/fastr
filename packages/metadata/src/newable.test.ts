import test from "ava";
import { getConstructor, isConstructor } from "./newable.js";

test("is constructor", (t) => {
  t.true(isConstructor(class Foo {}));
  t.true(isConstructor(function Bar() {}));
  t.true(isConstructor(Array));
  t.true(isConstructor(Date));
  t.false(isConstructor(undefined));
  t.false(isConstructor(null));
  t.false(isConstructor(0));
  t.false(isConstructor(true));
  t.false(isConstructor(""));
  t.false(isConstructor({}));
  t.false(isConstructor([]));
  t.false(isConstructor(() => {}));
});

test("get constructor", (t) => {
  class Foo {}

  t.is(getConstructor(new Foo()), Foo);
  t.is(getConstructor({}), Object as any);
  t.is(getConstructor([]), Array as any);

  t.throws(
    () => {
      getConstructor(undefined);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      getConstructor(null);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      getConstructor("");
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      getConstructor(0);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      getConstructor(Object.create(null));
    },
    { instanceOf: TypeError },
  );
});
