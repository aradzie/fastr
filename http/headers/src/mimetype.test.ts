import test from "ava";
import { MimeType } from "./mimetype";

test("matches", (t) => {
  t.false(new MimeType("text", "plain").matches("text/html"));
  t.true(new MimeType("text", "plain").matches("text/plain"));
  t.true(new MimeType("text", "plain").matches("text/*"));
  t.true(new MimeType("text", "plain").matches("*/plain"));
  t.true(new MimeType("text", "plain").matches("*/*"));
  t.true(new MimeType("text", "*").matches("text/plain"));
  t.true(new MimeType("*", "plain").matches("text/plain"));
  t.true(new MimeType("*", "*").matches("text/plain"));
  t.true(new MimeType("text", "*").matches("text/*"));
  t.true(new MimeType("*", "plain").matches("*/plain"));
  t.true(new MimeType("*", "*").matches("*/*"));
});

test("parse", (t) => {
  const t1 = MimeType.parse("TEXT/PLAIN");
  t.is(t1.name, "text/plain");
  t.is(t1.type, "text");
  t.is(t1.subtype, "plain");
  t.is(t1.parameters, null);

  const t2 = MimeType.parse("text/plain; A = 1; B = 2; charset=utf-8");
  t.is(t2.name, "text/plain");
  t.is(t2.type, "text");
  t.is(t2.subtype, "plain");
  t.is(t2.parameters?.get("charset"), "utf-8");
  t.is(t2.parameters?.get("A"), "1");
  t.is(t2.parameters?.get("B"), "2");

  t.is(MimeType.parse("illegal garbage"), MimeType.APPLICATION_OCTET_STREAM);
});

test("toJSON", (t) => {
  t.is(
    JSON.stringify({
      mimeType: MimeType.parse("text/plain; a=1; b=2; charset=utf-8"),
    }),
    '{"mimeType":"text/plain; a=1; b=2; charset=utf-8"}',
  );
});

test("toString", (t) => {
  t.is(
    String(MimeType.parse("text/plain; a=1; b=2; charset=utf-8")),
    "text/plain; a=1; b=2; charset=utf-8",
  );
});
