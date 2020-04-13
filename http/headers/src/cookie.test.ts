import test from "ava";
import { Cookie } from "./cookie";

test("parse", (t) => {
  t.deepEqual(
    Cookie.parse(" ; X = ; Name0 = Value0 ;Name1=Value1"),
    new Cookie(
      new Map([
        ["Name0", "Value0"],
        ["Name1", "Value1"],
      ]),
    ),
  );
});

test("toString", (t) => {
  t.is(
    String(
      new Cookie(
        new Map([
          ["Name0", "Value0"],
          ["Name1", "Value1"],
        ]),
      ),
    ),
    "Name0=Value0; Name1=Value1",
  );
});

test.skip("escape cookie value", (t) => {
  const value = ' ",;\u{1F36D},;" ';
  // TODO t.is(Cookie.parse(String(new Cookie("name", value))).value, value);
});
