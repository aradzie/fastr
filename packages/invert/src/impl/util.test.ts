import test from "ava";
import { toValueId } from "./util.js";

test("toValueId", (t) => {
  const idString = "abc";
  const idSymbol = Symbol("xyz");
  const idClass = class Example {};

  t.is(toValueId(idString), idString);
  t.is(toValueId(idSymbol), idSymbol);
  t.is(toValueId(idClass), idClass);

  t.throws(() => toValueId(null), {
    message: "<null> cannot be used as a ValueId",
  });
  t.throws(() => toValueId(undefined), {
    message: "<undefined> cannot be used as a ValueId",
  });
  t.throws(() => toValueId(true), {
    message: "<boolean true> cannot be used as a ValueId",
  });
  t.throws(() => toValueId(1), {
    message: "<number 1> cannot be used as a ValueId",
  });
});
