import test from "ava";
import { inject, injectable } from "./annotations.js";
import { Container } from "./container.js";
import { methodHandle } from "./methods.js";

test("check params", (t) => {
  @injectable()
  class Foo {
    abc() {}
    xyz = "omg";
  }

  const foo = new Foo();

  t.notThrows(() => {
    methodHandle(foo, "abc");
  });

  t.throws(
    () => {
      methodHandle(foo, "xyz");
    },
    {
      instanceOf: TypeError,
      message: "Method xyz is missing in class Foo",
    },
  );

  t.throws(
    () => {
      methodHandle({}, "xyz");
    },
    {
      instanceOf: TypeError,
      message: "Method xyz is missing in class Object",
    },
  );

  t.throws(
    () => {
      methodHandle([], "xyz");
    },
    {
      instanceOf: TypeError,
      message: "Method xyz is missing in class Array",
    },
  );

  t.throws(
    () => {
      methodHandle("omg" as any, "xyz");
    },
    {
      instanceOf: TypeError,
    },
  );
});

test("apply", (t) => {
  @injectable()
  class Demo {
    constructor(readonly prefix: string) {}

    demo(@inject("name") name: string) {
      return `${this.prefix}/${name}`;
    }
  }

  const container = new Container();
  container.bind("name").toValue("b");
  const handle = methodHandle(new Demo("a"), "demo");

  t.is(handle.apply(container), "a/b");
});
