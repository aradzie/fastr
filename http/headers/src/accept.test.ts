import test from "ava";
import { Accept } from "./accept";
import { MediaType } from "./mediatype";
import { Parameters } from "./parameters";

test("accepts with empty list", (t) => {
  const accept = new Accept([]);

  t.true(accept.accepts("text/html"));
  t.true(accept.accepts("any/type"));
  t.true(accept.accepts("*/*"));
});

test("accepts without range", (t) => {
  const accept = new Accept([
    new MediaType("x-foo", "c", new Parameters([["q", "0.8"]])),
    new MediaType("x-foo", "b", new Parameters([["q", "0.9"]])),
    new MediaType("x-foo", "a"),
  ]);

  t.true(accept.accepts("x-foo/a"));
  t.is(accept.accepts("x-foo/b"), 0.9);
  t.is(accept.accepts("x-foo/c"), 0.8);
  t.false(accept.accepts("any/type"));
});

test("accepts with range", (t) => {
  const accept = new Accept([
    new MediaType("*", "*", new Parameters([["q", "0.8"]])),
    new MediaType("x-foo", "c", new Parameters([["q", "0.8"]])),
    new MediaType("x-foo", "b", new Parameters([["q", "0.9"]])),
    new MediaType("x-foo", "a"),
  ]);

  t.true(accept.accepts("x-foo/a"));
  t.is(accept.accepts("x-foo/b"), 0.9);
  t.is(accept.accepts("x-foo/c"), 0.8);
  t.is(accept.accepts("any/type"), 0.8);
});

test("parse", (t) => {
  t.deepEqual(
    Accept.parse(
      "text/html," +
        "application/xhtml+xml," +
        "application/xml;q=0.9," +
        "image/webp," +
        "*/*;q=0.8",
    ),
    new Accept([
      new MediaType("text", "html"),
      new MediaType("application", "xhtml+xml"),
      new MediaType("image", "webp"),
      new MediaType("application", "xml", new Parameters([["q", "0.9"]])),
      new MediaType("*", "*", new Parameters([["q", "0.8"]])),
    ]),
  );
});

test("stringify", (t) => {
  t.is(
    String(
      new Accept([
        new MediaType("text", "html"),
        new MediaType("application", "xhtml+xml"),
        new MediaType("application", "xml", new Parameters([["q", "0.9"]])),
        new MediaType("image", "webp"),
        new MediaType("*", "*", new Parameters([["q", "0.8"]])),
      ]),
    ),
    "text/html, " +
      "application/xhtml+xml, " +
      "image/webp, " +
      "application/xml; q=0.9, " +
      "*/*; q=0.8",
  );
});
