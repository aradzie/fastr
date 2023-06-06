import test from "ava";
import { Cookie } from "./cookie.js";

test("parse values", (t) => {
  t.deepEqual(Cookie.parse(``), new Cookie([]));
  t.deepEqual(Cookie.parse(`;;;`), new Cookie([]));
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
  t.deepEqual(
    Cookie.parse(`a=a%01; b="b%01"; c=c%%%; d="d%%%"`),
    new Cookie([
      ["a", "a\x01"],
      ["b", "b\x01"],
      ["c", "c%%%"],
      ["d", "d%%%"],
    ]),
  );
  t.deepEqual(
    Cookie.parse("a=1; A=2; a=x"),
    new Cookie([
      ["a", "x"],
      ["A", "2"],
    ]),
  );
});

test("parse invalid values", (t) => {
  t.deepEqual(
    Cookie.parse(";;;   ?==;;;   a=1\\2;;;   b=2;;;   c   ;;;   d=4"),
    new Cookie([
      ["?", "="],
      ["a", "1\\2"],
      ["b", "2"],
      ["d", "4"],
    ]),
  );
});

test("format values", (t) => {
  t.is(String(new Cookie([])), "");
  t.is(String(new Cookie([["a", ""]])), "a=");
  t.is(String(new Cookie([["a", "1"]])), "a=1");
  t.is(
    String(
      new Cookie([
        ["a", "1"],
        ["b", "2"],
      ]),
    ),
    "a=1; b=2",
  );
});

test("format encoded values", (t) => {
  t.is(
    String(
      new Cookie([
        ["a", `\x00`],
        ["b", `\x01`],
        ["c", `"?"`],
        ["d", `\\?\\`],
      ]),
    ),
    "a=%00; b=%01; c=%22%3F%22; d=%5C%3F%5C",
  );
});

test("format and parse encoded cookie value", (t) => {
  const value = ` \\",;\\u{1F36D},;"\\ `;
  const cookie = new Cookie([["name", value]]);
  t.is(Cookie.parse(String(cookie)).get("name"), value);
});

test("validate cooke name", (t) => {
  t.throws(
    () => {
      new Cookie([["", "value"]]).toString();
    },
    { instanceOf: TypeError, message: "Invalid cookie name []" },
  );
  t.throws(
    () => {
      new Cookie([["???", "value"]]).toString();
    },
    { instanceOf: TypeError, message: "Invalid cookie name [???]" },
  );
});
