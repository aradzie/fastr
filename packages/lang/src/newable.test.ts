import test from "ava";
import {
  getBaseConstructor,
  getConstructor,
  isConstructor,
} from "./newable.js";

test("is constructor", (t) => {
  class Foo {}
  function Bar() {}

  t.true(isConstructor(Foo));
  t.true(isConstructor(Bar));
  t.true(isConstructor(Object));
  t.true(isConstructor(Array));
  t.true(isConstructor(String));
  t.true(isConstructor(Number));
  t.true(isConstructor(Boolean));
  t.true(isConstructor(Function));

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
  function Bar() {}

  t.is(getConstructor(Reflect.construct(Foo, [])), Foo as any);
  t.is(getConstructor(Reflect.construct(Bar, [])), Bar as any);
  t.is(getConstructor<any>({}), Object);
  t.is(getConstructor<any>([]), Array);

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
      getConstructor(true);
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

test("get base constructor", (t) => {
  class A {}
  class B extends A {}
  class C extends B {}
  function Foo() {}

  t.is(getBaseConstructor(C), B);
  t.is(getBaseConstructor(B), A);
  t.is(getBaseConstructor(A), null);
  t.is(getBaseConstructor(Foo as any), null);

  t.is(getBaseConstructor(Object), null);
  t.is(getBaseConstructor(Array), null);
  t.is(getBaseConstructor(String), null);
  t.is(getBaseConstructor(Number), null);
  t.is(getBaseConstructor(Boolean), null);
  t.is(getBaseConstructor(Function), null);

  t.throws(
    () => {
      getBaseConstructor(undefined as any);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      getBaseConstructor(null as any);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      getBaseConstructor("" as any);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      getBaseConstructor(0 as any);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      getBaseConstructor(true as any);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      getBaseConstructor(Object.create(null));
    },
    { instanceOf: TypeError },
  );
});
