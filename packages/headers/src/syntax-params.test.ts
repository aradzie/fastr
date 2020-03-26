import test from "ava";
import { Params, readWeight } from "./params.js";
import { readParams } from "./syntax-params.js";
import { Scanner } from "./syntax.js";

test("read params", (t) => {
  {
    const params = new Params();
    t.is(readParams(new Scanner(`;a=1`), params), true);
    t.deepEqual([...params], [["a", "1"]]);
  }

  {
    const params = new Params();
    t.is(readParams(new Scanner(` ; a=1`), params), true);
    t.deepEqual([...params], [["a", "1"]]);
  }

  {
    const params = new Params();
    t.is(readParams(new Scanner(`;a=1; b=2 ; c="3" `), params), true);
    t.deepEqual(
      [...params],
      [
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
      ],
    );
  }

  {
    const params = new Params();
    t.is(readParams(new Scanner(`;q=foo-bar`), params), true);
    t.deepEqual([...params], [["q", "foo-bar"]]);
  }
});

test("read params with weight", (t) => {
  {
    const params = new Params();
    const w = { q: -1 };
    t.is(readParams(new Scanner(`;a=1;q=0.1`), params, w), true);
    t.deepEqual([...params], [["a", "1"]]);
    t.is(w.q, 0.1);
  }

  {
    const params = new Params();
    const w = { q: -1 };
    t.is(readParams(new Scanner(` ; q=0.1 ; a=1`), params, w), true);
    t.deepEqual([...params], [["a", "1"]]);
    t.is(w.q, 0.1);
  }

  {
    const params = new Params();
    const w = { q: -1 };
    t.is(readParams(new Scanner(`;a=1;q=0.1;b=2;c="3"`), params, w), true);
    t.deepEqual(
      [...params],
      [
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
      ],
    );
    t.is(w.q, 0.1);
  }
});

test("read weight", (t) => {
  {
    const w = { q: -1 };
    t.is(readWeight(new Scanner(`;q=0`), w), true);
    t.is(w.q, 0);
  }

  {
    const w = { q: -1 };
    t.is(readWeight(new Scanner(`;q=1`), w), true);
    t.is(w.q, 1);
  }

  {
    const w = { q: -1 };
    t.is(readWeight(new Scanner(`;q=0.1`), w), true);
    t.is(w.q, 0.1);
  }

  {
    const w = { q: -1 };
    t.is(readWeight(new Scanner(` ; q=0.1`), w), true);
    t.is(w.q, 0.1);
  }

  {
    const w = { q: -1 };
    t.is(readWeight(new Scanner(` ; Q=0.1`), w), true);
    t.is(w.q, 0.1);
  }
});

test("params syntax error", (t) => {
  const params = new Params();
  t.is(readParams(new Scanner(``), params), true);
  t.is(readParams(new Scanner(` `), params), true);
  t.is(readParams(new Scanner(`;`), params), false);
  t.is(readParams(new Scanner(` ; `), params), false);
  t.is(readParams(new Scanner(`;a`), params), false);
  t.is(readParams(new Scanner(`;a=`), params), false);
  t.deepEqual([...params], []);
});

test("params with weight syntax error", (t) => {
  const params = new Params();
  const w = { q: -1 };
  t.is(readParams(new Scanner(`;q=x`), params, w), false);
  t.is(readParams(new Scanner(`;q="x"`), params, w), false);
  t.is(readParams(new Scanner(`;q=2`), params, w), false);
  t.is(readParams(new Scanner(`;q=-1`), params, w), false);
  t.deepEqual([...params], []);
  t.is(w.q, -1);
});

test("weight syntax error", (t) => {
  const w = { q: -1 };
  t.is(readWeight(new Scanner(``), w), true);
  t.is(readWeight(new Scanner(` `), w), true);
  t.is(readWeight(new Scanner(`;`), w), false);
  t.is(readWeight(new Scanner(` ; `), w), false);
  t.is(readWeight(new Scanner(`;q=x`), w), false);
  t.is(readWeight(new Scanner(`;q="x"`), w), false);
  t.is(readWeight(new Scanner(`;q=2`), w), false);
  t.is(readWeight(new Scanner(`;q=-1`), w), false);
  t.is(w.q, -1);
});
