import test from "ava";
import { toUrl } from "./template";

test("verbatim", (t) => {
  t.is(toUrl("/foo/bar"), "/foo/bar");
  t.is(toUrl("/foo/bar", {}), "/foo/bar");
  t.is(toUrl("/foo/bar", { params: {}, query: {} }), "/foo/bar");
  t.is(toUrl("/foo/bar?a=b"), "/foo/bar?a=b");
  t.is(toUrl("/foo/bar?a=b", {}), "/foo/bar?a=b");
  t.is(toUrl("/foo/bar?a=b", { params: {}, query: {} }), "/foo/bar?a=b");
});

test("replace path params", (t) => {
  t.is(toUrl("/foo/{a"), "/foo/{a");
  t.is(toUrl("/foo/a}"), "/foo/a}");
  t.is(toUrl("/foo/{a}", { params: { a: 1, b: 2 } }), "/foo/1");
  t.is(toUrl("/foo/{b}", { params: { a: 1, b: 2 } }), "/foo/2");
  t.is(toUrl("/foo/{a}{b}", { params: { a: 1, b: 2 } }), "/foo/12");
  t.is(toUrl("/foo/{a}/{b}", { params: { a: 1, b: 2 } }), "/foo/1/2");
  t.is(
    toUrl("/foo/{a}-{b}/{a}-{b}/bar", { params: { a: 1, b: 2 } }),
    "/foo/1-2/1-2/bar",
  );
});

test("replace path params with missing names", (t) => {
  t.throws(
    () => {
      toUrl("/{x}");
    },
    { message: "Missing path parameter [x]" },
  );
  t.throws(
    () => {
      toUrl("/{x}", {});
    },
    { message: "Missing path parameter [x]" },
  );
  t.throws(
    () => {
      toUrl("/{x}", { params: {} });
    },
    { message: "Missing path parameter [x]" },
  );
  t.throws(
    () => {
      toUrl("/{x}", { params: { x: null } });
    },
    { message: "Missing path parameter [x]" },
  );
});

test("update query string", (t) => {
  t.is(toUrl("/foo", { query: { a: 1, b: 2 } }), "/foo?a=1&b=2");
  t.is(toUrl("/foo?x=0", { query: { a: 1, b: 2 } }), "/foo?x=0&a=1&b=2");
  t.is(toUrl("/foo?x=0", { query: { x: 1 } }), "/foo?x=0&x=1");
});

test("escape path params", (t) => {
  t.is(
    toUrl("/foo/{x}", { params: new Map([["x", "\u{1F36C}"]]) }),
    "/foo/%F0%9F%8D%AC",
  );
});

test("escape query string", (t) => {
  t.is(
    toUrl("/foo", { query: new Map([["x", "\u{1F36C}"]]) }),
    "/foo?x=%F0%9F%8D%AC",
  );
});
