import test from "ava";
import { mergeSearchParams } from "./url";

test("merge", (t) => {
  t.is(mergeSearchParams("/", new URLSearchParams()), "/");
  t.is(mergeSearchParams("/", new URLSearchParams("a=1")), "/?a=1");
  t.is(mergeSearchParams("/?a=1", new URLSearchParams()), "/?a=1");
  t.is(mergeSearchParams("/?a=1", new URLSearchParams("a=2")), "/?a=1&a=2");
  t.is(mergeSearchParams("/?a=1", new URLSearchParams("b=2")), "/?a=1&b=2");
});
