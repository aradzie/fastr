import test from "ava";
import { ContentType } from "./content-type.js";
import { MediaType } from "./media-type.js";

test("validate type", (t) => {
  t.throws(() => {
    new ContentType("*/*");
  });
  t.throws(() => {
    new ContentType("foo/*");
  });
});

test("stringify", (t) => {
  t.is(String(new ContentType("foo/bar")), "foo/bar");
  t.is(String(new ContentType("foo/bar; a=x")), "foo/bar; a=x");
});

test("parse", (t) => {
  t.deepEqual(
    ContentType.parse("foo/bar").type, //
    new MediaType("foo", "bar"),
  );
  t.deepEqual(
    ContentType.parse("foo/bar; a=x").type, //
    new MediaType("foo", "bar", [["a", "x"]]),
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
