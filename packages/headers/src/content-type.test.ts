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

test("subtype", (t) => {
  const header = ContentType.parse("a/b");

  t.is(header.is("A/B;X=*;Y=*"), "A/B;X=*;Y=*");
  t.is(header.is("A/B"), "A/B");

  t.is(header.is("x/y", "a/b", "a/*", "*/*"), "a/b");
  t.is(header.is("x/y", "a/*", "*/*"), "a/*");
  t.is(header.is("x/y", "*/*"), "*/*");
  t.is(header.is("x/y"), false);

  t.is(header.is("a/b;x=1;y=2", "a/b;x=*;y=*"), "a/b;x=*;y=*");
  t.is(header.is("a/b;x=1;y=2", "a/b;x=*"), "a/b;x=*");
  t.is(header.is("a/b;x=1;y=2", "a/b;y=*"), "a/b;y=*");
  t.is(header.is("a/b;x=1;y=2"), false);
});

test("subtype with parameters", (t) => {
  const header = ContentType.parse("a/b; x=1; y=2");

  t.is(header.is("a/b;z=0", "A/B;X=1;Y=2", "a/b;x=*;y=*"), "A/B;X=1;Y=2");
  t.is(header.is("a/b;z=0", "A/B;Y=2;X=1", "a/b;x=*;y=*"), "A/B;Y=2;X=1");

  t.is(header.is("a/b;z=0", "a/b;x=1;y=2", "a/b;x=*;y=*"), "a/b;x=1;y=2");
  t.is(header.is("a/b;z=0", "a/b;y=2;x=1", "a/b;x=*;y=*"), "a/b;y=2;x=1");
  t.is(header.is("a/b;z=0", "a/b;x=1", "a/b;x=*;y=*"), "a/b;x=1");
  t.is(header.is("a/b;z=0", "a/b;y=2", "a/b;x=*;y=*"), "a/b;y=2");
  t.is(header.is("a/b;z=0", "a/b;x=*;y=*"), "a/b;x=*;y=*");
  t.is(header.is("a/b;z=0", "a/b;x=*"), "a/b;x=*");
  t.is(header.is("a/b;z=0", "a/b;y=*"), "a/b;y=*");
  t.is(header.is("a/b;z=0", "a/b;x=0;y=0"), false);
  t.is(header.is("a/b;z=0", "a/b;x=0"), false);
  t.is(header.is("a/b;z=0", "a/b;y=0"), false);
  t.is(header.is("a/b;x=0"), false);
  t.is(header.is("a/b;y=0"), false);
  t.is(header.is("a/b;z=0"), false);
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
