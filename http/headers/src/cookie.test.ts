import test from "ava";
import { Cookie } from "./cookie.js";

test("parse", (t) => {
  t.deepEqual(
    Cookie.parse("=; X=; Name0=Value0; Name1=Value1"),
    new Cookie([
      ["", ""],
      ["X", ""],
      ["Name0", "Value0"],
      ["Name1", "Value1"],
    ]),
  );
});

test("toString", (t) => {
  t.is(
    String(
      new Cookie([
        ["Name0", "Value0"],
        ["Name1", "Value1"],
      ]),
    ),
    "Name0=Value0; Name1=Value1",
  );
});

test("first entry wins", (t) => {
  t.deepEqual(
    [
      ...new Cookie([
        ["a", "1"],
        ["b", "2"],
        ["a", "x"],
      ]),
    ],
    [
      ["a", "1"],
      ["b", "2"],
    ],
  );
});

test("escape cookie value", (t) => {
  const value = ' ",;\u{1F36D},;" ';
  const cookie = new Cookie([["name", value]]);
  t.is(Cookie.parse(String(cookie)).get("name"), value);
});
