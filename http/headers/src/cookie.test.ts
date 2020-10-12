import test from "ava";
import { Cookie } from "./cookie.js";

test("ignore empty cookies", (t) => {
  t.deepEqual(Cookie.parse(""), new Cookie([]));
  t.deepEqual(Cookie.parse(" "), new Cookie([]));
  t.deepEqual(Cookie.parse(";"), new Cookie([]));
  t.deepEqual(Cookie.parse(" ; ; ; "), new Cookie([]));
  t.deepEqual(Cookie.parse("="), new Cookie([]));
  t.deepEqual(Cookie.parse("=1"), new Cookie([]));
  t.deepEqual(Cookie.parse(" = 1 "), new Cookie([]));
  t.deepEqual(Cookie.parse("=;="), new Cookie([]));
  t.deepEqual(Cookie.parse(" = ; = "), new Cookie([]));
  t.deepEqual(Cookie.parse("=1;=2"), new Cookie([]));
  t.deepEqual(Cookie.parse(" = 1 ; = 2 "), new Cookie([]));
});

test("parse empty values", (t) => {
  t.deepEqual(
    Cookie.parse("a; b="),
    new Cookie([
      ["a", ""],
      ["b", ""],
    ]),
  );
});

test("parse simple values", (t) => {
  t.deepEqual(Cookie.parse("Name=Value"), new Cookie([["Name", "Value"]]));
  t.deepEqual(Cookie.parse("Name=Value;"), new Cookie([["Name", "Value"]]));
  t.deepEqual(Cookie.parse(";Name=Value"), new Cookie([["Name", "Value"]]));
  t.deepEqual(Cookie.parse(";Name=Value;"), new Cookie([["Name", "Value"]]));
  t.deepEqual(
    Cookie.parse("a=1;b=2"),
    new Cookie([
      ["a", "1"],
      ["b", "2"],
    ]),
  );
  t.deepEqual(
    Cookie.parse(" ; a = 1 ; b = 2 ; "),
    new Cookie([
      ["a", "1"],
      ["b", "2"],
    ]),
  );
});

test("parse quoted values", (t) => {
  t.deepEqual(
    Cookie.parse(`a="1"; b="2"`),
    new Cookie([
      ["a", "1"],
      ["b", "2"],
    ]),
  );
  t.deepEqual(Cookie.parse(`a="1`), new Cookie([]));
  t.deepEqual(Cookie.parse(`a="1;b=2`), new Cookie([["b", "2"]]));
  t.deepEqual(Cookie.parse(`a=1"`), new Cookie([]));
  t.deepEqual(Cookie.parse(`a=1";b=2`), new Cookie([["b", "2"]]));
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

test("ignore invalid cookies", (t) => {
  t.deepEqual(Cookie.parse("(x)=1; y=\x00; a=1"), new Cookie([["a", "1"]]));
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
    { code: "ERR_INVALID_COOKIE_HEADER" },
  );
  t.throws(
    () => {
      new Cookie().has("?");
    },
    { code: "ERR_INVALID_COOKIE_HEADER" },
  );
  t.throws(
    () => {
      new Cookie().get("?");
    },
    { code: "ERR_INVALID_COOKIE_HEADER" },
  );
  t.throws(
    () => {
      new Cookie().set("?", "anything");
    },
    { code: "ERR_INVALID_COOKIE_HEADER" },
  );
  t.throws(
    () => {
      new Cookie().delete("?");
    },
    { code: "ERR_INVALID_COOKIE_HEADER" },
  );
});
