import test from "ava";
import { RequestCacheControl } from "./request-cache-control.js";

test("parse", (t) => {
  t.deepEqual(
    RequestCacheControl.parse("no-cache,no-store,max-age=123,ext1,ext2=value"),
    new RequestCacheControl({
      noCache: true,
      noStore: true,
      maxAge: 123,
      ext: [
        ["ext1", null],
        ["ext2", "value"],
      ],
    }),
  );

  t.deepEqual(
    RequestCacheControl.parse(
      "no-cache , no-store , max-age=123 , ext1 , ext2=value",
    ),
    new RequestCacheControl({
      noCache: true,
      noStore: true,
      maxAge: 123,
      ext: [
        ["ext1", null],
        ["ext2", "value"],
      ],
    }),
  );
});

test("toString", (t) => {
  t.is(
    String(
      new RequestCacheControl({
        noCache: true,
        noStore: true,
        maxAge: 123,
        maxStale: 456,
        ext: [
          ["ext1", null],
          ["ext2", "value"],
        ],
      }),
    ),
    "no-cache, no-store, max-age=123, max-stale=456, ext1, ext2=value",
  );
});
