import test from "ava";
import { Cookie } from "./cookie";

test("parse", (t) => {
  t.deepEqual(Cookie.parse("Name0=Value0"), new Cookie("Name0", "Value0"));
  t.deepEqual(
    Cookie.parse("Name0=Value0; path=path0"),
    new Cookie("Name0", "Value0", {
      path: "path0",
    }),
  );
  t.deepEqual(
    Cookie.parse("Name0=Value0; domain=domain0"),
    new Cookie("Name0", "Value0", {
      domain: "domain0",
    }),
  );
  t.deepEqual(
    Cookie.parse(
      "Name0 = Value0 ; " +
        "Path = path0 ; " +
        "Domain = domain0 ; " +
        "Extra = extra0",
    ),
    new Cookie("Name0", "Value0", {
      path: "path0",
      domain: "domain0",
    }),
  );
});

test("toString", (t) => {
  t.is(String(new Cookie("Name0", "Value0")), "Name0=Value0");
  t.is(
    String(
      new Cookie("Name0", "Value0", {
        path: "path0",
      }),
    ),
    "Name0=Value0; path=path0",
  );
  t.is(
    String(
      new Cookie("Name0", "Value0", {
        domain: "domain0",
      }),
    ),
    "Name0=Value0; domain=domain0",
  );
  t.is(
    String(
      new Cookie("Name0", "Value0", {
        path: "path0",
        domain: "domain0",
      }),
    ),
    "Name0=Value0; path=path0; domain=domain0",
  );
});

test("escape cookie value", (t) => {
  const value = ' ",;\u{1F36D},;" ';
  t.is(Cookie.parse(String(new Cookie("name", value))).value, value);
});
