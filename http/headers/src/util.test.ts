import test from "ava";
import { multiEntries } from "./util";

test("flatten map entries", (t) => {
  t.deepEqual([...multiEntries(new Map<string, unknown>())], []);
  t.deepEqual(
    [
      ...multiEntries(
        new Map<string, unknown>([
          ["a", 1],
          ["b", [2, 3]],
        ]),
      ),
    ],
    [
      ["a", "1"],
      ["b", "2"],
      ["b", "3"],
    ],
  );
});

test("flatten record entries", (t) => {
  t.deepEqual([...multiEntries({})], []);
  t.deepEqual(
    [...multiEntries({ a: 1, b: [2, 3] })],
    [
      ["a", "1"],
      ["b", "2"],
      ["b", "3"],
    ],
  );
});

test("flatten array entries", (t) => {
  t.deepEqual([...multiEntries([])], []);
  t.deepEqual(
    [
      ...multiEntries([
        ["a", 1],
        ["b", [2, 3]],
      ]),
    ],
    [
      ["a", "1"],
      ["b", "2"],
      ["b", "3"],
    ],
  );
});
