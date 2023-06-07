import test from "ava";
import { parseDate, stringifyDate } from "./date.js";

test("parse", (t) => {
  t.deepEqual(parseDate("Thu, 01 Jan 1970 00:00:00 GMT"), new Date(0));
  t.deepEqual(parseDate("Thu, 01 Jan 1970 00:00:01 GMT"), new Date(1000));
  t.is(parseDate(""), null);
  t.is(parseDate("?"), null);
  t.is(parseDate("abc"), null);
});

test("stringify", (t) => {
  t.is(stringifyDate(new Date(0)), "Thu, 01 Jan 1970 00:00:00 GMT");
  t.is(stringifyDate(new Date(1000)), "Thu, 01 Jan 1970 00:00:01 GMT");
});
