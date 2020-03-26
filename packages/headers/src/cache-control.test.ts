import test from "ava";
import { CacheControl } from "./cache-control.js";
import { InvalidHeaderError } from "./errors.js";

test("parse", (t) => {
  t.deepEqual(
    CacheControl.parse("no-cache,no-store,max-age=123,ext1,ext2=value"),
    new CacheControl({
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
    CacheControl.parse("no-cache , no-store , max-age=123 , ext1 , ext2=value"),
    new CacheControl({
      noCache: true,
      noStore: true,
      maxAge: 123,
      ext: [
        ["ext1", null],
        ["ext2", "value"],
      ],
    }),
  );

  t.throws(
    () => {
      CacheControl.parse(";");
    },
    {
      instanceOf: InvalidHeaderError,
      message: 'Header "Cache-Control" has invalid value ";"',
    },
  );
});

test("toString", (t) => {
  t.is(
    String(
      new CacheControl({
        noCache: true,
        noStore: true,
        maxAge: 123,
        ext: [
          ["ext1", null],
          ["ext2", "value"],
        ],
      }),
    ),
    "no-cache, no-store, max-age=123, ext1, ext2=value",
  );
});
