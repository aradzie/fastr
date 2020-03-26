import test from "ava";
import { splitList, splitPair } from "./strings";

test("split one", (t) => {
  t.deepEqual(splitPair("", ","), ["", ""]);
  t.deepEqual(splitPair("   ", ","), ["", ""]);
  t.deepEqual(splitPair("x", ","), ["x", ""]);
  t.deepEqual(splitPair("  x  ", ","), ["x", ""]);
  t.deepEqual(splitPair("x,y,z", ","), ["x", "y,z"]);
  t.deepEqual(splitPair("  x  ,  y,z  ", ","), ["x", "y,z"]);
});

test("split all", (t) => {
  t.deepEqual(splitList("", ","), []);
  t.deepEqual(splitList("   ", ","), []);
  t.deepEqual(splitList("x", ","), ["x"]);
  t.deepEqual(splitList("  x  ", ","), ["x"]);
  t.deepEqual(splitList("x,y,z", ","), ["x", "y", "z"]);
  t.deepEqual(splitList("  x  ,  y,z  ", ","), ["x", "y", "z"]);
});
