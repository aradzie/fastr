import test from "ava";
import { parseHeaders } from "./headers.js";

test("parse", (t) => {
  t.deepEqual(Object.fromEntries(parseHeaders("")), {});
  t.deepEqual(Object.fromEntries(parseHeaders("\r\n")), {});
  t.deepEqual(Object.fromEntries(parseHeaders("foo: a")), {
    foo: "a",
  });
  t.deepEqual(Object.fromEntries(parseHeaders("foo: a\r\n")), {
    foo: "a",
  });
  t.deepEqual(Object.fromEntries(parseHeaders("foo: a\r\nbar: b:c=d")), {
    foo: "a",
    bar: "b:c=d",
  });
  t.deepEqual(Object.fromEntries(parseHeaders("\r\nfoo: a\r\nbar:b:c=d\n\n")), {
    foo: "a",
    bar: "b:c=d",
  });
  t.deepEqual(
    Object.fromEntries(
      parseHeaders(
        "Date: Thu, 01 Jan 1970 00:00:01 GMT\r\n" +
          "Accept: image/png\r\n" +
          "Accept: image/*\r\n" +
          "Cache-Control: no-cache\r\n" +
          "Cache-Control: no-store\r\n",
      ),
    ),
    {
      "date": "Thu, 01 Jan 1970 00:00:01 GMT",
      "accept": "image/png, image/*",
      "cache-control": "no-cache, no-store",
    },
  );
});
