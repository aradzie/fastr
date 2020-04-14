import test from "ava";
import { Accept, Entry } from "./accept";

test("accepts with empty list", (t) => {
  const accept = new Accept();

  t.true(accept.accepts("text/html"));
  t.true(accept.accepts("any/type"));
  t.true(accept.accepts("*/*"));
});

test("accepts without range", (t) => {
  const accept = new Accept()
    .add("x-foo/c", 0.5)
    .add("x-foo/b", 0.6)
    .add("x-foo/a");

  t.true(accept.accepts("x-foo/a"));
  t.is(accept.accepts("x-foo/b"), 0.6);
  t.is(accept.accepts("x-foo/c"), 0.5);
  t.false(accept.accepts("any/type"));
});

test("accepts with range", (t) => {
  const accept = new Accept()
    .add("*/*", 0.8)
    .add("x-foo/c", 0.5)
    .add("x-foo/b", 0.6)
    .add("x-foo/a");

  t.true(accept.accepts("x-foo/a"));
  t.is(accept.accepts("x-foo/b"), 0.8);
  t.is(accept.accepts("x-foo/c"), 0.8);
  t.is(accept.accepts("any/type"), 0.8);
});

test("stringify", (t) => {
  t.is(
    String(
      new Accept()
        .add("*/*", 0.8)
        .add("text/html")
        .add("application/xhtml+xml")
        .add("application/xml", 0.9)
        .add("image/webp"),
    ),
    "text/html, " +
      "application/xhtml+xml, " +
      "image/webp, " +
      "application/xml; q=0.9, " +
      "*/*; q=0.8",
  );
});

test("parse simple", (t) => {
  t.deepEqual([...Accept.parse("text/html")], [new Entry("text/html")]);
  t.deepEqual(
    [...Accept.parse("text/html,text/*")],
    [new Entry("text/html"), new Entry("text/*")],
  );
});

test("parse simple with extra whitespace", (t) => {
  t.deepEqual(
    [...Accept.parse("text/html  ,  text/*  ")],
    [new Entry("text/html"), new Entry("text/*")],
  );
  t.deepEqual(
    [...Accept.parse("text/html  ,  text/*  ,  ")],
    [new Entry("text/html"), new Entry("text/*")],
  );
});

test("parse with parameters", (t) => {
  t.deepEqual(
    [...Accept.parse("text/html;q=0.5")],
    [new Entry("text/html", 0.5)],
  );
  t.deepEqual(
    [...Accept.parse("text/html;q=0.5,text/*;q=0.1")],
    [new Entry("text/html", 0.5), new Entry("text/*", 0.1)],
  );
});

test("parse with parameters with extra whitespace", (t) => {
  t.deepEqual(
    [...Accept.parse("text/html  ;  q  =  0.5  ,  text/* ;  q  =  0.1 ")],
    [new Entry("text/html", 0.5), new Entry("text/*", 0.1)],
  );
  t.deepEqual(
    [...Accept.parse("text/html  ;  q  =  0.5  ,  text/* ;  q  =  0.1  ,  ")],
    [new Entry("text/html", 0.5), new Entry("text/*", 0.1)],
  );
});

test("parse with quoted parameters", (t) => {
  t.deepEqual(
    [...Accept.parse('text/html; q="0.5", text/*; q="0.1"')],
    [new Entry("text/html", 0.5), new Entry("text/*", 0.1)],
  );
});

test("parse with extra parameters", (t) => {
  t.deepEqual(
    [...Accept.parse("text/html; q=0.5; extra=x, text/*; extra=x; q=0.1")],
    [new Entry("text/html", 0.5), new Entry("text/*", 0.1)],
  );
});

for (const input of [
  "/",
  "text",
  "text/",
  "text/;",
  "text/,",
  "text/plain extra",
  "text/plain; =",
  // "text/plain; q",
  // "text/plain; q=",
  "text/plain; q=;",
  "text/plain; q=\0,",
]) {
  test(`parse error while parsing malformed input ${input}`, (t) => {
    t.throws(
      () => {
        Accept.parse(input);
      },
      {
        code: "ERR_INVALID_ACCEPT",
      },
    );
  });
}
