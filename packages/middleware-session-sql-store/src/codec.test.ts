import test from "ava";
import { BSON_CODEC } from "./codec.js";

test("bson encode and decode", (t) => {
  t.deepEqual(BSON_CODEC.decode(BSON_CODEC.encode({})), {});
  t.deepEqual(BSON_CODEC.decode(BSON_CODEC.encode({ v: [1, 2, 3] })), {
    v: [1, 2, 3],
  });
  t.deepEqual(BSON_CODEC.decode(BSON_CODEC.encode({ v: "日本語" })), {
    v: "日本語",
  });
  t.deepEqual(BSON_CODEC.decode(BSON_CODEC.encode({ f() {} })), {});
});
