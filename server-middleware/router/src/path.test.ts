import test from "ava";
import { parse } from "./parser";
import {
  LiteralSegment,
  makePath,
  MatchedPathParams,
  matchFragment,
  matchPrefix,
  PatternSegment,
} from "./path";

test("match fragment", (t) => {
  const [literal] = parse("/something") as [LiteralSegment];
  const [pattern] = parse("/[{p1:[a-z]+}-{p2:[a-z]+}]") as [PatternSegment];
  const params: MatchedPathParams = { x: "x" };

  t.false(matchFragment(literal, "anything", params));
  t.true(matchFragment(literal, "something", params));
  t.deepEqual(params, { x: "x" });
  t.false(matchFragment(pattern, "[abc]", params));
  t.false(matchFragment(pattern, "[123-456]", params));
  t.deepEqual(params, { x: "x" });
  t.true(matchFragment(pattern, "[abc-def]", params));
  t.deepEqual(params, { x: "x", p1: "abc", p2: "def" });
});

test("match prefix", (t) => {
  const segments = parse("/before/{p1:[a-z+]}-{p2:[a-z+]}/");
  const params: MatchedPathParams = { x: "x" };

  t.is(matchPrefix(segments, "/", params), null);
  t.is(matchPrefix(segments, "/before/suffix", params), null);
  t.is(matchPrefix(segments, "/wrong/a-b", params), null);
  t.is(matchPrefix(segments, "/before/1-2", params), null);
  t.is(matchPrefix(segments, "/before/a-b", params), null);
  t.deepEqual(params, { x: "x" });
  t.deepEqual(matchPrefix(segments, "/before/a-b/", params), {
    suffix: "/",
    params: { x: "x", p1: "a", p2: "b" },
  });
  t.deepEqual(params, { x: "x", p1: "a", p2: "b" });
  t.deepEqual(matchPrefix(segments, "/before/x-y/suffix", params), {
    suffix: "/suffix",
    params: { x: "x", p1: "x", p2: "y" },
  });
  t.deepEqual(params, { x: "x", p1: "x", p2: "y" });
});

test("make path", (t) => {
  const segments = parse("/x/{a:\\d+}/y/{b:\\d+}");

  t.is(makePath(segments, { a: 1, b: 2 }), "/x/1/y/2");
  t.is(makePath(segments, { a: 1, b: 2, unknown: 0 }), "/x/1/y/2");
  t.throws(
    () => {
      makePath(segments, { unknown: 0 });
    },
    { message: 'Path param "a" is missing' },
  );
});
