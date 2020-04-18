import test from "ava";
import { isJSON } from "./index";

test("accept plain object", (t) => {
  t.true(isJSON({}));
  t.true(isJSON({ a: 1 }));
  t.true(isJSON(Object.create(null)));
  t.true(isJSON(Object.create(null, { a: { value: 1, enumerable: true } })));
});

test("accept non-plain object with the toJSON method", (t) => {
  const o = new (class Dummy {
    ignored = 0;
    toJSON(): unknown {
      return { a: 1 };
    }
  })();
  t.true(isJSON(o));
  t.is(JSON.stringify(o), '{"a":1}');
});

test("reject invalid value", (t) => {
  // Try undefined.
  t.false(isJSON(undefined));

  // Try null.
  t.false(isJSON(null));

  // Try array.
  t.false(isJSON([]));

  // Try function.
  t.false(isJSON(() => null));

  // Try non-plain object.
  t.false(isJSON(Object.create({})));

  // Try non-plain object.
  t.false(isJSON(new (class Dummy {})()));
});
