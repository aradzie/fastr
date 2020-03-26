import test from "ava";
import { parse } from "./parser";
import { PatternSegment } from "./path";

test("parse simple", (t) => {
  t.deepEqual(parse("/"), [
    {
      type: "literal",
      literal: "/",
    },
  ]);
  t.deepEqual(parse("/abc"), [
    {
      type: "literal",
      literal: "abc",
    },
  ]);
  t.deepEqual(parse("/abc/"), [
    {
      type: "literal",
      literal: "abc/",
    },
  ]);
  t.deepEqual(parse("/abc/def"), [
    {
      type: "literal",
      literal: "abc/",
    },
    {
      type: "literal",
      literal: "def",
    },
  ]);
  t.deepEqual(parse("/abc/def/"), [
    {
      type: "literal",
      literal: "abc/",
    },
    {
      type: "literal",
      literal: "def/",
    },
  ]);
});

test("parse patterns", (t) => {
  t.deepEqual(parse("/{p1}"), [
    {
      type: "pattern",
      literal: "{p1}",
      pattern: new RegExp("^(?<p1>[^/]+)$"),
      template: "{p1}",
      names: ["p1"],
    },
  ]);
  t.deepEqual(parse("/{p1}/"), [
    {
      type: "pattern",
      literal: "{p1}/",
      pattern: new RegExp("^(?<p1>[^/]+)/$"),
      template: "{p1}/",
      names: ["p1"],
    },
  ]);
  t.deepEqual(parse("/{p1:[a-z]+}"), [
    {
      type: "pattern",
      literal: "{p1:[a-z]+}",
      pattern: new RegExp("^(?<p1>[a-z]+)$"),
      template: "{p1}",
      names: ["p1"],
    },
  ]);
  t.deepEqual(parse("/a{p1}b"), [
    {
      type: "pattern",
      literal: "a{p1}b",
      pattern: new RegExp("^a(?<p1>[^/]+)b$"),
      template: "a{p1}b",
      names: ["p1"],
    },
  ]);
  t.deepEqual(parse("/a{p1}b/{p2}"), [
    {
      type: "pattern",
      literal: "a{p1}b/",
      pattern: new RegExp("^a(?<p1>[^/]+)b/$"),
      template: "a{p1}b/",
      names: ["p1"],
    },
    {
      type: "pattern",
      literal: "{p2}",
      pattern: new RegExp("^(?<p2>[^/]+)$"),
      template: "{p2}",
      names: ["p2"],
    },
  ]);
  t.deepEqual(parse("/x/{p1}/y/{p2}/z"), [
    {
      type: "literal",
      literal: "x/",
    },
    {
      type: "pattern",
      literal: "{p1}/",
      pattern: new RegExp("^(?<p1>[^/]+)/$"),
      template: "{p1}/",
      names: ["p1"],
    },
    {
      type: "literal",
      literal: "y/",
    },
    {
      type: "pattern",
      literal: "{p2}/",
      pattern: new RegExp("^(?<p2>[^/]+)/$"),
      template: "{p2}/",
      names: ["p2"],
    },
    {
      type: "literal",
      literal: "z",
    },
  ]);
  t.deepEqual(parse("/{p1:[a-z]+}-{p2:[0-9]+}"), [
    {
      type: "pattern",
      literal: "{p1:[a-z]+}-{p2:[0-9]+}",
      pattern: new RegExp("^(?<p1>[a-z]+)-(?<p2>[0-9]+)$"),
      template: "{p1}-{p2}",
      names: ["p1", "p2"],
    },
  ]);
  t.deepEqual(parse("/icon-{name:[a-z]+}.png"), [
    {
      type: "pattern",
      literal: "icon-{name:[a-z]+}.png",
      pattern: new RegExp("^icon-(?<name>[a-z]+)\\.png$"),
      template: "icon-{name}.png",
      names: ["name"],
    },
  ]);
});

test("escape patterns", (t) => {
  const [segment] = parse("/^([|{name:[a-z]+}|]).*+?$") as [PatternSegment];
  t.deepEqual(segment, {
    type: "pattern",
    literal: "^([|{name:[a-z]+}|]).*+?$",
    pattern: new RegExp(
      "^\\^\\(\\[\\|(?<name>[a-z]+)\\|\\]\\)\\.\\*\\+\\?\\$$",
    ),
    template: "^([|{name}|]).*+?$",
    names: ["name"],
  });
  const { pattern } = segment;
  t.true(pattern.test("^([|name|]).*+?$"));
});
