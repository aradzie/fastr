import test from "ava";
import { Accepted } from "./accepted.js";

test("reject invalid values", (t) => {
  class W extends Accepted<string> {
    override compare(candidate: string): number | null {
      return null;
    }
  }

  const w = new W();

  t.notThrows(() => {
    w.q = 0;
  });
  t.notThrows(() => {
    w.q = 1;
  });
  t.throws(() => {
    w.q = NaN;
  });
  t.throws(() => {
    w.q = Infinity;
  });
  t.throws(() => {
    w.q = -1;
  });
  t.throws(() => {
    w.q = 2;
  });
});
