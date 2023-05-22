import test from "ava";
import { ContentType } from "./content-type.js";
import { MediaType } from "./media-type.js";

test("validate type", (t) => {
  const header = new ContentType("foo/bar");

  const a = MediaType.parse("*/*");
  const b = MediaType.parse("foo/bar; q=1");

  t.throws(() => {
    header.type = a;
  });
  t.throws(() => {
    header.type = b;
  });

  t.is(String(header.type), "foo/bar");
});

test("stringify", (t) => {
  t.is(String(new ContentType("foo/bar")), "foo/bar");
});

test("parse", (t) => {
  t.deepEqual(ContentType.parse("foo/bar"), new ContentType("foo/bar"));
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
