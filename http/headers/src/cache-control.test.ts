import test from "ava";
import { CacheControl } from "./cache-control";

test("parse", (t) => {
  t.deepEqual(
    CacheControl.parse("private, no-cache, no-store, max-age=123"),
    new CacheControl({
      isPrivate: true,
      noCache: true,
      noStore: true,
      maxAge: 123,
    }),
  );
});

test("toString", (t) => {
  t.is(
    String(
      new CacheControl({
        isPrivate: true,
        noCache: true,
        noStore: true,
        maxAge: 123,
      }),
    ),
    "private, no-cache, no-store, max-age=123",
  );
});
