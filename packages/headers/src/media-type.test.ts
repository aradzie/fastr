import test from "ava";
import { MediaType } from "./media-type.js";

test("matches", (t) => {
  t.false(new MediaType("text", "plain").matches("text/html"));
  t.true(new MediaType("text", "plain").matches("text/plain"));
  t.true(new MediaType("text", "plain").matches("text/*"));
  t.true(new MediaType("text", "plain").matches("*/plain"));
  t.true(new MediaType("text", "plain").matches("*/*"));
  t.true(new MediaType("text", "*").matches("text/plain"));
  t.true(new MediaType("*", "plain").matches("text/plain"));
  t.true(new MediaType("*", "*").matches("text/plain"));
  t.true(new MediaType("text", "*").matches("text/*"));
  t.true(new MediaType("*", "plain").matches("*/plain"));
  t.true(new MediaType("*", "*").matches("*/*"));
});

test("parse simple", (t) => {
  const t1 = MediaType.parse("TEXT/PLAIN");
  t.is(t1.essence, "text/plain");
  t.is(t1.type, "text");
  t.is(t1.subtype, "plain");
});

test("parse wildcard", (t) => {
  const t1 = MediaType.parse("*/*");
  t.is(t1.essence, "*/*");
  t.is(t1.type, "*");
  t.is(t1.subtype, "*");

  const t2 = MediaType.parse("text/*");
  t.is(t2.essence, "text/*");
  t.is(t2.type, "text");
  t.is(t2.subtype, "*");
});

test("parse with parameters", (t) => {
  const t1 = MediaType.parse("text/plain;a=1;b=2;charset=utf-8");
  t.is(t1.essence, "text/plain");
  t.is(t1.type, "text");
  t.is(t1.subtype, "plain");
  t.is(t1.params.get("charset"), "utf-8");
  t.is(t1.params.get("a"), "1");
  t.is(t1.params.get("b"), "2");

  const t2 = MediaType.parse("text/plain ; A = 1; B = 2 ; charset=UTF-8 ");
  t.is(t2.essence, "text/plain");
  t.is(t2.type, "text");
  t.is(t2.subtype, "plain");
  t.is(t2.params.get("charset"), "UTF-8");
  t.is(t2.params.get("a"), "1");
  t.is(t2.params.get("b"), "2");
});

test("parse with errors", (t) => {
  t.throws(() => {
    MediaType.parse("illegal garbage");
  });
});

test("toString", (t) => {
  t.is(
    String(MediaType.parse("text/plain; A=1; B=2; charset=UTF-8")),
    "text/plain; a=1; b=2; charset=UTF-8",
  );
});
