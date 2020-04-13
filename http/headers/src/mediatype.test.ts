import test from "ava";
import { MediaType } from "./mediatype";

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

test("parse", (t) => {
  const t1 = MediaType.parse("TEXT/PLAIN");
  t.is(t1.name, "text/plain");
  t.is(t1.type, "text");
  t.is(t1.subtype, "plain");
  t.is(t1.parameters, null);

  const t2 = MediaType.parse("text/plain; A = 1; B = 2; charset=utf-8");
  t.is(t2.name, "text/plain");
  t.is(t2.type, "text");
  t.is(t2.subtype, "plain");
  t.is(t2.parameters?.get("charset"), "utf-8");
  t.is(t2.parameters?.get("a"), "1");
  t.is(t2.parameters?.get("b"), "2");

  t.is(MediaType.parse("illegal garbage"), MediaType.APPLICATION_OCTET_STREAM);
});

test("toJSON", (t) => {
  t.is(
    JSON.stringify({
      mimeType: MediaType.parse("text/plain; a=1; b=2; charset=utf-8"),
    }),
    '{"mimeType":"text/plain; a=1; b=2; charset=utf-8"}',
  );
});

test("toString", (t) => {
  t.is(
    String(MediaType.parse("text/plain; a=1; b=2; charset=utf-8")),
    "text/plain; a=1; b=2; charset=utf-8",
  );
});
