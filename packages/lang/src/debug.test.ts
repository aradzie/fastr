import test from "ava";
import { typeId } from "./debug.js";

test("typeId", (t) => {
  class Example {
    get [Symbol.toStringTag]() {
      return "Example";
    }
  }

  t.is(typeId(null), "<null>");
  t.is(typeId(undefined), "<undefined>");
  t.is(typeId(Symbol), "<function Symbol>");
  t.is(typeId(Object), "<function Object>");
  t.is(typeId(Array), "<function Array>");
  t.is(typeId(Function), "<function Function>");
  t.is(typeId(Boolean), "<function Boolean>");
  t.is(typeId(Number), "<function Number>");
  t.is(typeId(String), "<function String>");
  t.is(typeId(BigInt), "<function BigInt>");
  t.is(typeId(Date), "<function Date>");
  t.is(typeId(Error), "<function Error>");
  t.is(
    typeId(() => null),
    "<function>",
  );
  t.is(
    typeId(function () {}),
    "<function>",
  );
  t.is(
    typeId(function abc() {}),
    "<function abc>",
  );
  t.is(typeId(class {}), "<function>");
  t.is(typeId(class abc {}), "<function abc>");
  t.is(typeId(Example), "<function Example>");
  t.is(typeId(Symbol()), "<symbol>");
  t.is(typeId(Symbol("abc")), "<symbol abc>");
  t.is(typeId(true), "<boolean true>");
  t.is(typeId(123), "<number 123>");
  t.is(typeId(123n), "<bigint 123>");
  t.is(typeId("abc"), '<string "abc">');
  t.is(typeId({}), "[object Object]");
  t.is(typeId([]), "[object Array]");
  t.is(typeId(new (class {})()), "[object Object]");
  t.is(typeId(new (class abc {})()), "[object Object]");
  t.is(typeId(new Example()), "[object Example]");
  t.is(typeId(new Date()), "[object Date]");
  t.is(typeId(new Error()), "[object Error]");
  t.is(typeId(globalThis), "[object global]");
});
