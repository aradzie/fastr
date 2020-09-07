import test from "ava";
import { mergeSearchParams } from "./merge.js";
import { URLSearchParams } from "./url.js";

test("merge with URLSearchParams", (t) => {
  t.is(mergeSearchParams("/", new URLSearchParams()), "/");
  t.is(mergeSearchParams("/", new URLSearchParams("a=1")), "/?a=1");
  t.is(mergeSearchParams("/?a=1", new URLSearchParams()), "/?a=1");
  t.is(mergeSearchParams("/?a=1", new URLSearchParams("a=2")), "/?a=1&a=2");
  t.is(mergeSearchParams("/?a=1", new URLSearchParams("b=2")), "/?a=1&b=2");
});

test("merge with Map", (t) => {
  t.is(mergeSearchParams("/", new Map()), "/");
  t.is(mergeSearchParams("/", new Map([["a", 1]])), "/?a=1");
  t.is(mergeSearchParams("/?a=1", new Map()), "/?a=1");
  t.is(mergeSearchParams("/?a=1", new Map([["a", 2]])), "/?a=1&a=2");
  t.is(mergeSearchParams("/?a=1", new Map([["b", 2]])), "/?a=1&b=2");
});

test("merge with Array", (t) => {
  t.is(mergeSearchParams("/", []), "/");
  t.is(mergeSearchParams("/", [["a", 1]]), "/?a=1");
  t.is(mergeSearchParams("/?a=1", []), "/?a=1");
  t.is(mergeSearchParams("/?a=1", [["a", 2]]), "/?a=1&a=2");
  t.is(mergeSearchParams("/?a=1", [["b", 2]]), "/?a=1&b=2");
});
