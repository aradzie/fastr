import test from "ava";
import { Cookie } from "./cookie.js";

test("parse empty values", (t) => {
  t.deepEqual(
    Cookie.parse(`a=`),
    new Cookie([
      ["a", ""], //
    ]),
  );
  t.deepEqual(
    Cookie.parse(`a=;b=`),
    new Cookie([
      ["a", ""],
      ["b", ""],
    ]),
  );
  t.deepEqual(
    Cookie.parse(`a=;  b=`),
    new Cookie([
      ["a", ""],
      ["b", ""],
    ]),
  );
});

test("parse simple values", (t) => {
  t.deepEqual(
    Cookie.parse("a=1"),
    new Cookie([
      ["a", "1"], //
    ]),
  );
  t.deepEqual(
    Cookie.parse("a=1;b=2"),
    new Cookie([
      ["a", "1"],
      ["b", "2"],
    ]),
  );
  t.deepEqual(
    Cookie.parse("a=1;  b=2"),
    new Cookie([
      ["a", "1"],
      ["b", "2"],
    ]),
  );
});

test("parse quoted values", (t) => {
  t.deepEqual(
    Cookie.parse(`a="1"`),
    new Cookie([
      ["a", "1"], //
    ]),
  );
  t.deepEqual(
    Cookie.parse(`a="1";b="2"`),
    new Cookie([
      ["a", "1"],
      ["b", "2"],
    ]),
  );
  t.deepEqual(
    Cookie.parse(`a="1";  b="2"`),
    new Cookie([
      ["a", "1"],
      ["b", "2"],
    ]),
  );
});

test("parse escaped values", (t) => {
  t.deepEqual(
    Cookie.parse(`a=%00; b="%01"; c=%%%`),
    new Cookie([
      ["a", "\x00"],
      ["b", "\x01"],
      ["c", "%%%"],
    ]),
  );
});

test("parse duplicate names", (t) => {
  t.deepEqual(
    Cookie.parse("a=1; b=2; a=x"),
    new Cookie([
      ["a", "x"],
      ["b", "2"],
    ]),
  );
});

test("format empty values", (t) => {
  t.is(String(new Cookie([])), "");
  t.is(String(new Cookie([["one", ""]])), "one=");
});

test("format simple values", (t) => {
  t.is(String(new Cookie([["one", "1"]])), "one=1");
  t.is(
    String(
      new Cookie([
        ["one", "1"],
        ["two", "2"],
      ]),
    ),
    "one=1; two=2",
  );
});

test("format escaped values", (t) => {
  t.is(
    String(
      new Cookie([
        ["a", "\x00"],
        ["b", "\x01"],
        ["c", '"?"'],
      ]),
    ),
    "a=%00; b=%01; c=%22%3F%22",
  );
});

test("format and parse escaped cookie value", (t) => {
  const value = ' ",;\u{1F36D},;" ';
  const cookie = new Cookie([["name", value]]);
  t.is(Cookie.parse(String(cookie)).get("name"), value);
});

test("validate cooke name", (t) => {
  t.throws(
    () => {
      new Cookie([["?", "anything"]]);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      new Cookie().has("?");
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      new Cookie().get("?");
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      new Cookie().set("?", "anything");
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      new Cookie().delete("?");
    },
    { instanceOf: TypeError },
  );
});
