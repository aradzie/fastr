import test from "ava";
import { splitLines, splitList, splitPair } from "./strings";

test("split pair", (t) => {
  t.deepEqual(splitPair("", ","), ["", ""]);
  t.deepEqual(splitPair("   ", ","), ["", ""]);
  t.deepEqual(splitPair("x", ","), ["x", ""]);
  t.deepEqual(splitPair("  x  ", ","), ["x", ""]);
  t.deepEqual(splitPair("x,y,z", ","), ["x", "y,z"]);
  t.deepEqual(splitPair("  x  ,  y,z  ", ","), ["x", "y,z"]);
});

test("split list", (t) => {
  t.deepEqual(splitList("", ","), []);
  t.deepEqual(splitList("   ", ","), []);
  t.deepEqual(splitList("x", ","), ["x"]);
  t.deepEqual(splitList("  x  ", ","), ["x"]);
  t.deepEqual(splitList("x,y,z", ","), ["x", "y", "z"]);
  t.deepEqual(splitList("  x  ,  y,z  ", ","), ["x", "y", "z"]);
});

test("split lines", (t) => {
  t.deepEqual(splitLines(""), []);
  t.deepEqual(splitLines("\n\r\r\n"), []);
  t.deepEqual(splitLines("x"), ["x"]);
  t.deepEqual(splitLines("  x  "), ["x"]);
  t.deepEqual(splitLines("x\r\n"), ["x"]);
  t.deepEqual(splitLines("  x  \r\n  "), ["x"]);
  t.deepEqual(splitLines("\nx\ny\rz\r\n"), ["x", "y", "z"]);
});
