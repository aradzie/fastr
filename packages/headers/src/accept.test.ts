import test from "ava";
import { Accept } from "./accept.js";
import { MediaType } from "./media-type.js";

test("negotiate when header is empty", (t) => {
  const header = new Accept();

  t.deepEqual(header.negotiateAll("a/x", "a/y"), ["a/x", "a/y"]);
  t.deepEqual(header.negotiateAll("a/y", "a/x"), ["a/y", "a/x"]);
});

test("negotiate when header is a wildcard", (t) => {
  const header = new Accept();

  header.add("*/*");

  t.deepEqual(header.negotiateAll("a/x", "a/y"), ["a/x", "a/y"]);
  t.deepEqual(header.negotiateAll("a/y", "a/x"), ["a/y", "a/x"]);
});

test("negotiate when header is a wildcard; q=0", (t) => {
  const header = new Accept();

  header.add("*/*", 0);

  t.deepEqual(header.negotiateAll("a/x", "a/y"), []);
  t.deepEqual(header.negotiateAll("a/y", "a/x"), []);

  header.add("a/x");
  header.add("a/y");

  t.deepEqual(header.negotiateAll("a/x", "a/y", "a/z"), ["a/x", "a/y"]);
  t.deepEqual(header.negotiateAll("a/z", "a/y", "a/x"), ["a/x", "a/y"]);
});

test("negotiate orders by specificity", (t) => {
  const header = new Accept();

  header.add("*/*", 0.3);
  header.add("a/*", 0.2);
  header.add("a/x", 0.1);

  t.deepEqual(header.negotiateAll("a/x", "a/y", "b/x"), ["a/x", "a/y", "b/x"]);
  t.deepEqual(header.negotiateAll("b/x", "a/y", "a/x"), ["a/x", "a/y", "b/x"]);
});

test("negotiate finds the most specific candidates", (t) => {
  const header = new Accept();

  header
    .add("a/a", 0.1)
    .add("b/b", 0.1)
    .add("u/u", 0.2)
    .add("v/v", 0.2)
    .add("z/z", 0.0);

  t.deepEqual(
    header.negotiateAll("a/a", "b/b", "u/u", "v/v", "x/x", "y/y", "z/z"), //
    ["u/u", "v/v", "a/a", "b/b"],
  );
  t.deepEqual(
    header.negotiateAll("z/z", "y/y", "x/x", "v/v", "u/u", "b/b", "a/a"), //
    ["u/u", "v/v", "a/a", "b/b"],
  );

  header.add("*/*", 0.9);

  t.deepEqual(
    header.negotiateAll("a/a", "b/b", "u/u", "v/v", "x/x", "y/y", "z/z"), //
    ["u/u", "v/v", "a/a", "b/b", "x/x", "y/y"],
  );
  t.deepEqual(
    header.negotiateAll("z/z", "y/y", "x/x", "v/v", "u/u", "b/b", "a/a"), //
    ["u/u", "v/v", "a/a", "b/b", "y/y", "x/x"],
  );
});

test("negotiate is case-insensitive", (t) => {
  const header = new Accept();

  header.add("a/a");
  header.add("B/B");

  t.deepEqual(header.negotiateAll("A/A", "b/b"), ["A/A", "b/b"]);
  t.deepEqual(header.negotiateAll("a/a", "B/B"), ["a/a", "B/B"]);
});

test("negotiate rejects empty candidates", (t) => {
  const header = new Accept("a/a");

  t.throws(
    () => {
      header.negotiate();
    },
    { message: "Empty candidates" },
  );
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
    "*/*; q=0.8, " +
      "text/html, " +
      "application/xhtml+xml, " +
      "application/xml; q=0.9, " +
      "image/webp",
  );
});

test("parse", (t) => {
  t.deepEqual(Accept.parse("text/html"), new Accept().add("text/html"));
  t.deepEqual(
    Accept.parse("text/html;q=0.5"),
    new Accept().add("text/html", 0.5),
  );
  t.deepEqual(
    Accept.parse("text/html ; q=0.5"),
    new Accept().add("text/html", 0.5),
  );
  t.deepEqual(
    Accept.parse("text/html,text/*"),
    new Accept().add("text/html").add("text/*"),
  );
  t.deepEqual(
    Accept.parse("text/html , text/*"),
    new Accept().add("text/html").add("text/*"),
  );
  t.deepEqual(
    Accept.parse("text/html;q=0.5,text/*"),
    new Accept().add("text/html", 0.5).add("text/*"),
  );
  t.deepEqual(
    Accept.parse("text/html ; q=0.5 , text/*"),
    new Accept().add("text/html", 0.5).add("text/*"),
  );
  t.deepEqual(
    Accept.parse("text/html; q=0.5; extra=x, text/*; extra=y; q=0.1"),
    new Accept()
      .add(new MediaType("text", "html", [["extra", "x"]]), 0.5)
      .add(new MediaType("text", "*", [["extra", "y"]]), 0.1),
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
  "text/plain; q",
  "text/plain; q=",
  "text/plain; q=;",
  "text/plain; q=\0,",
]) {
  test(`parse error while parsing malformed input ${input}`, (t) => {
    t.throws(() => {
      Accept.parse(input);
    });
  });
}
