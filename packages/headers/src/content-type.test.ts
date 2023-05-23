import test from "ava";
import { ContentType } from "./content-type.js";
import { MediaType } from "./media-type.js";

test("validate type", (t) => {
  t.throws(() => {
    new ContentType("*/*");
  });
  t.throws(() => {
    new ContentType("a/*");
  });
  t.throws(() => {
    new ContentType("a/b; x=*");
  });
});

test("is", (t) => {
  const header = ContentType.parse("text/plain; charset=UTF-8");

  t.is(header.is("text/plain"), "text/plain");
  t.is(header.is("TEXT/PLAIN"), "TEXT/PLAIN");
  t.is(header.is("text/*"), "text/*");
  t.is(header.is("TEXT/*"), "TEXT/*");
  t.is(header.is("*/*"), "*/*");
  t.is(header.is("text/html"), false);
  t.is(header.is("application/json"), false);
  t.is(header.is("text/html", "application/json"), false);
  t.is(header.is("text/html", "application/json", "text/plain"), "text/plain");
  t.is(header.is("text/html", "application/json", "*/*"), "*/*");
});

test("stringify", (t) => {
  t.is(String(new ContentType("A/B")), "a/b");
  t.is(String(new ContentType("A/B; X=1")), "a/b; x=1");
});

test("parse", (t) => {
  t.deepEqual(
    ContentType.parse("A/B").type, //
    new MediaType("a", "b"),
  );
  t.deepEqual(
    ContentType.parse("A/B; X=1").type, //
    new MediaType("a", "b", [["x", "1"]]),
  );
});

for (const input of [
  "/",
  "text",
  "text/",
  "text/;",
  "text/,",
  "text/plain extra",
]) {
  test(`parse error while parsing malformed input ${input}`, (t) => {
    t.throws(() => {
      ContentType.parse(input);
    });
  });
}
