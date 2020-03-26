import test from "ava";
import { Accept } from "./accept";
import { MimeType } from "./mimetype";
import { Parameters } from "./parameters";

test("accepts with empty list", (t) => {
  const accept = new Accept([]);

  t.true(accept.accepts("text/html"));
  t.true(accept.accepts("any/type"));
  t.true(accept.accepts("*/*"));
});

test("accepts without range", (t) => {
  const accept = new Accept([
    new MimeType("x-foo", "c", new Parameters([["q", "0.8"]])),
    new MimeType("x-foo", "b", new Parameters([["q", "0.9"]])),
    new MimeType("x-foo", "a"),
  ]);

  t.true(accept.accepts("x-foo/a"));
  t.is(accept.accepts("x-foo/b"), 0.9);
  t.is(accept.accepts("x-foo/c"), 0.8);
  t.false(accept.accepts("any/type"));
});

test("accepts with range", (t) => {
  const accept = new Accept([
    new MimeType("*", "*", new Parameters([["q", "0.8"]])),
    new MimeType("x-foo", "c", new Parameters([["q", "0.8"]])),
    new MimeType("x-foo", "b", new Parameters([["q", "0.9"]])),
    new MimeType("x-foo", "a"),
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
      new MimeType("text", "html"),
      new MimeType("application", "xhtml+xml"),
      new MimeType("image", "webp"),
      new MimeType("application", "xml", new Parameters([["q", "0.9"]])),
      new MimeType("*", "*", new Parameters([["q", "0.8"]])),
    ]),
  );
});

test("stringify", (t) => {
  t.is(
    String(
      new Accept([
        new MimeType("text", "html"),
        new MimeType("application", "xhtml+xml"),
        new MimeType("application", "xml", new Parameters([["q", "0.9"]])),
        new MimeType("image", "webp"),
        new MimeType("*", "*", new Parameters([["q", "0.8"]])),
      ]),
    ),
    "text/html, " +
      "application/xhtml+xml, " +
      "image/webp, " +
      "application/xml; q=0.9, " +
      "*/*; q=0.8",
  );
});
