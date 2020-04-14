import test from "ava";
import { multiEntriesOf } from "./util";

test("flatten map entries", (t) => {
  t.deepEqual([...multiEntriesOf(new Map<string, unknown>())], []);
  t.deepEqual(
    [
      ...multiEntriesOf(
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
  t.deepEqual([...multiEntriesOf({})], []);
  t.deepEqual(
    [...multiEntriesOf({ a: 1, b: [2, 3] })],
    [
      ["a", "1"],
      ["b", "2"],
      ["b", "3"],
    ],
  );
});

test("flatten array entries", (t) => {
  t.deepEqual([...multiEntriesOf([])], []);
  t.deepEqual(
    [
      ...multiEntriesOf([
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
