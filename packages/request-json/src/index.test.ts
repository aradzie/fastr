import test from "ava";
import { isJSON } from "./index.js";

test("accept plain object", (t) => {
  t.true(isJSON({}));
  t.true(isJSON({ a: 1 }));
  t.true(isJSON(Object.create(null)));
  t.true(isJSON(Object.create(null, { a: { value: 1, enumerable: true } })));
});

test("accept non-plain object with the toJSON method", (t) => {
  t.true(
    isJSON(
      new (class Dummy {
        toJSON(): unknown {
          return { a: 1 };
        }
      })(),
    ),
  );
});

test("accept array", (t) => {
  t.true(isJSON([]));
  t.true(isJSON([{ a: 1 }]));
});

test("reject invalid value", (t) => {
  t.false(isJSON(undefined));
  t.false(isJSON(null));
  t.false(isJSON(true));
  t.false(isJSON(0));
  t.false(isJSON(""));
  t.false(isJSON(Symbol()));
  t.false(isJSON(/abc/));
  t.false(isJSON(() => null));
  t.false(isJSON(Object.create({})));
  t.false(isJSON(new (class Dummy {})()));
  t.false(isJSON(new Map()));
});
