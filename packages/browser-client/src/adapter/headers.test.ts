import test from "ava";
import { parseHeaders } from "./headers.js";

test("parse", (t) => {
  t.deepEqual(parseHeaders("").toJSON(), {});
  t.deepEqual(parseHeaders("\r\n").toJSON(), {});
  t.deepEqual(parseHeaders("foo: a").toJSON(), {
    foo: "a",
  });
  t.deepEqual(parseHeaders("foo: a\r\n").toJSON(), {
    foo: "a",
  });
  t.deepEqual(parseHeaders("foo: a\r\nbar: b:c=d").toJSON(), {
    foo: "a",
    bar: "b:c=d",
  });
  t.deepEqual(parseHeaders("\r\nfoo: a\r\nbar:b:c=d\n\n").toJSON(), {
    foo: "a",
    bar: "b:c=d",
  });
  t.deepEqual(
    parseHeaders(
      "Date: Thu, 01 Jan 1970 00:00:01 GMT\r\n" +
        "Accept: image/png\r\n" +
        "Accept: image/*\r\n" +
        "Cache-Control: no-cache\r\n" +
        "Cache-Control: no-store\r\n",
    ).toJSON(),
    {
      "Date": "Thu, 01 Jan 1970 00:00:01 GMT",
      "Accept": "image/png, image/*",
      "Cache-Control": "no-cache, no-store",
    },
  );
});
