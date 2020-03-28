import test from "ava";
import { Parameters } from "./parameters";

test("parse", (t) => {
  const params1 = Parameters.from("  ");
  t.deepEqual([...params1], []);
  t.is(params1.charset, null);
  t.is(params1.q, null);

  const params2 = Parameters.from("charset=utf-8; q=0.1; A = X ; B = Y ");
  t.deepEqual(
    [...params2],
    [
      ["charset", "utf-8"],
      ["q", "0.1"],
      ["a", "X"],
      ["b", "Y"],
    ],
  );
  t.is(params2.charset, "utf-8");
  t.is(params2.q, 0.1);
});

test("toJSON", (t) => {
  t.is(JSON.stringify({ p: new Parameters([]) }), '{"p":""}');
  t.is(JSON.stringify({ p: new Parameters([["a", "x"]]) }), '{"p":"a=x"}');
  t.is(
    JSON.stringify({
      p: new Parameters([
        ["a", "x"],
        ["b", "y"],
      ]),
    }),
    '{"p":"a=x; b=y"}',
  );
});

test("toString", (t) => {
  t.is(String(new Parameters([])), "");
  t.is(String(new Parameters([["a", "x"]])), "a=x");
  t.is(
    String(
      new Parameters([
        ["a", "x"],
        ["b", "y"],
      ]),
    ),
    "a=x; b=y",
  );
});
