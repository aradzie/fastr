import test from "ava";
import { MediaType } from "./media-type.js";

test("matches", (t) => {
  t.false(MediaType.from("a/b").matches(MediaType.from("a/c")));
  t.false(MediaType.from("a/b").matches(MediaType.from("c/b")));
  t.true(MediaType.from("a/b; x=1").matches(MediaType.from("a/b; y=2")));
  t.true(MediaType.from("a/b").matches(MediaType.from("a/b")));
  t.true(MediaType.from("a/b").matches(MediaType.from("a/*")));
  t.true(MediaType.from("a/b").matches(MediaType.from("*/b")));
  t.true(MediaType.from("a/b").matches(MediaType.from("*/*")));
  t.true(MediaType.from("a/*").matches(MediaType.from("a/b")));
  t.true(MediaType.from("*/b").matches(MediaType.from("a/b")));
  t.true(MediaType.from("*/*").matches(MediaType.from("a/b")));
  t.true(MediaType.from("a/*").matches(MediaType.from("a/*")));
  t.true(MediaType.from("*/b").matches(MediaType.from("*/b")));
  t.true(MediaType.from("*/*").matches(MediaType.from("*/*")));
});

test("parse simple", (t) => {
  const t1 = MediaType.parse("A/B");
  t.is(t1.essence, "a/b");
  t.is(t1.type, "a");
  t.is(t1.subtype, "b");
});

test("parse wildcard", (t) => {
  const t1 = MediaType.parse("*/*");
  t.is(t1.essence, "*/*");
  t.is(t1.type, "*");
  t.is(t1.subtype, "*");

  const t2 = MediaType.parse("a/*");
  t.is(t2.essence, "a/*");
  t.is(t2.type, "a");
  t.is(t2.subtype, "*");
});

test("parse with parameters", (t) => {
  const t1 = MediaType.parse("a/b;x=1;y=2;charset=utf-8");
  t.is(t1.essence, "a/b");
  t.is(t1.type, "a");
  t.is(t1.subtype, "b");
  t.is(t1.params.get("charset"), "utf-8");
  t.is(t1.params.get("x"), "1");
  t.is(t1.params.get("y"), "2");

  const t2 = MediaType.parse("a/b ; X = 1; Y = 2 ; charset=UTF-8 ");
  t.is(t2.essence, "a/b");
  t.is(t2.type, "a");
  t.is(t2.subtype, "b");
  t.is(t2.params.get("charset"), "UTF-8");
  t.is(t2.params.get("x"), "1");
  t.is(t2.params.get("y"), "2");
});

test("parse with errors", (t) => {
  t.throws(() => {
    MediaType.parse("illegal garbage");
  });
  t.throws(() => {
    MediaType.parse("a");
  });
  t.throws(() => {
    MediaType.parse("a/");
  });
  t.throws(() => {
    MediaType.parse("a/b;");
  });
});

test("toString", (t) => {
  t.is(
    String(MediaType.parse("a/b; X=1; Y=2; charset=UTF-8")),
    "a/b; x=1; y=2; charset=UTF-8",
  );
});
