import test from "ava";
import { ETag } from "./etag.js";

test("parse", (t) => {
  t.deepEqual({ ...new ETag('"') }, { value: '"', weak: false });
  t.deepEqual({ ...new ETag("x") }, { value: "x", weak: false });
  t.deepEqual({ ...new ETag('"x"') }, { value: "x", weak: false });
  t.deepEqual({ ...new ETag('W/"x"') }, { value: "x", weak: true });
});

test("stringify", (t) => {
  t.is(String(new ETag("x")), '"x"');
  t.is(String(new ETag("x", false)), '"x"');
  t.is(String(new ETag("x", true)), 'W/"x"');
});
