import test from "ava";
import { Params } from "./params.js";

test("reject invalid values", (t) => {
  t.throws(() => {
    new Params([[",", 1]]);
  });
});

test("stringify", (t) => {
  t.is(String(new Params([])), "");
  t.is(String(new Params([["a", 1]])), "a=1");
  t.is(
    String(
      new Params([
        ["a", 1],
        ["b", "2,3"],
      ]),
    ),
    'a=1; b="2,3"',
  );
});
