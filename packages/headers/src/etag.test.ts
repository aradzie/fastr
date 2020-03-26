import test from "ava";
import { ETag } from "./etag.js";

test("parse", (t) => {
  t.like(new ETag('"'), { _value: '"', _weak: false });
  t.like(new ETag("x"), { _value: "x", _weak: false });
  t.like(new ETag('"x"'), { _value: "x", _weak: false });
  t.like(new ETag('W/"x"'), { _value: "x", _weak: true });
});

test("stringify", (t) => {
  t.is(String(new ETag("x")), '"x"');
  t.is(String(new ETag("x", false)), '"x"');
  t.is(String(new ETag("x", true)), 'W/"x"');
});
