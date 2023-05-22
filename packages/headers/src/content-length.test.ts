import test from "ava";
import { ContentLength } from "./content-length.js";

test("validate type", (t) => {
  const header = new ContentLength(123);

  t.throws(() => {
    header.length = -1;
  });
  t.throws(() => {
    header.length = Math.PI;
  });

  t.is(header.length, 123);
});

test("stringify", (t) => {
  t.is(String(new ContentLength(123)), "123");
});

test("parse", (t) => {
  t.deepEqual(ContentLength.parse("123"), new ContentLength(123));
});
