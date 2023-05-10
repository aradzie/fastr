import test from "ava";
import { ownMethods } from "./reflection.js";

test("own methods", (t) => {
  class Foo {
    constructor() {}
    foo() {}
  }

  class Bar extends Foo {
    constructor() {
      super();
    }
    bar() {}
  }

  t.deepEqual([...ownMethods(Bar.prototype)], [
    [
      "bar",
      {
        configurable: true,
        enumerable: false,
        writable: true,
        value: Bar.prototype.bar,
      },
    ],
  ] satisfies [string | symbol, PropertyDescriptor][]);
});
