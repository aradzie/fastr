import test from "ava";
import { useCharset, useCharsetIfText } from "./charset.js";

test("useCharset", (t) => {
  t.is(
    useCharset("text/plain"), //
    "text/plain; charset=UTF-8",
  );
  t.is(
    useCharset("text/plain; charset=UTF-8"), //
    "text/plain; charset=UTF-8",
  );
  t.is(
    useCharset("text/plain; charset=utf8"), //
    "text/plain; charset=UTF-8",
  );
  t.is(
    useCharset("text/plain; charset=UTF-8; a=b"), //
    "text/plain; charset=UTF-8; a=b",
  );
  t.is(
    useCharset("text/plain; charset=utf8; a=b"), //
    "text/plain; charset=UTF-8; a=b",
  );
  t.throws(
    () => {
      useCharset("text/plain; charset=ASCII");
    },
    {
      instanceOf: TypeError,
      message: "Charset [ASCII] is not supported. Only [UTF-8] is supported.",
    },
  );
});

test("useCharsetIfText with text type", (t) => {
  t.is(
    useCharsetIfText("text/plain"), //
    "text/plain; charset=UTF-8",
  );
  t.is(
    useCharsetIfText("text/plain; charset=UTF-8"), //
    "text/plain; charset=UTF-8",
  );
  t.is(
    useCharsetIfText("text/plain; charset=utf8"), //
    "text/plain; charset=UTF-8",
  );
  t.is(
    useCharsetIfText("text/plain; charset=UTF-8; a=b"), //
    "text/plain; charset=UTF-8; a=b",
  );
  t.is(
    useCharsetIfText("text/plain; charset=utf8; a=b"), //
    "text/plain; charset=UTF-8; a=b",
  );
  t.throws(
    () => {
      useCharset("text/plain; charset=ASCII");
    },
    {
      instanceOf: TypeError,
      message: "Charset [ASCII] is not supported. Only [UTF-8] is supported.",
    },
  );
});

test("useCharsetIfText with binary type", (t) => {
  t.is(
    useCharsetIfText("foo/bar"), //
    "foo/bar",
  );
  t.is(
    useCharsetIfText("foo/bar; charset=UTF-8"), //
    "foo/bar; charset=UTF-8",
  );
  t.is(
    useCharsetIfText("foo/bar; charset=utf8"), //
    "foo/bar; charset=UTF-8",
  );
  t.is(
    useCharsetIfText("foo/bar; charset=UTF-8; a=b"), //
    "foo/bar; charset=UTF-8; a=b",
  );
  t.is(
    useCharsetIfText("foo/bar; charset=utf8; a=b"), //
    "foo/bar; charset=UTF-8; a=b",
  );
  t.throws(
    () => {
      useCharset("foo/bar; charset=ASCII");
    },
    {
      instanceOf: TypeError,
      message: "Charset [ASCII] is not supported. Only [UTF-8] is supported.",
    },
  );
});
