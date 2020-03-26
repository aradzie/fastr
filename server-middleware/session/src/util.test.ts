import test from "ava";
import { decode, encode, randomString } from "./util";

test("encode and decode", (t) => {
  t.deepEqual(decode(encode({})), {});
  t.deepEqual(decode(encode({ v: [1, 2, 3] })), { v: [1, 2, 3] });
  t.deepEqual(decode(encode({ v: "日本語" })), { v: "日本語" });
  t.deepEqual(decode(encode({ f() {} })), {});
});

test("decode invalid", (t) => {
  t.is(decode("!!!invalid base64!!!"), null);
  t.is(decode(Buffer.from([0, 0, 0]).toString("base64")), null);
});

test("random string", (t) => {
  const set = new Set();
  for (let i = 0; i < 100; i++) {
    const value = randomString(10);
    t.regex(value, /[a-zA-Z0-9]{10}/);
    t.false(set.has(value));
    set.add(value);
  }
});
