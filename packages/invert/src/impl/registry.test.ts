import test from "ava";

import { ValueBinding } from "./binding/value.js";
import { Registry } from "./registry.js";

test("mutate and query", (t) => {
  // Arrange.

  const a = new ValueBinding("a");
  const b = new ValueBinding("b");
  const c = new ValueBinding("c");
  const x = new ValueBinding("x");

  const registry = new Registry();

  // Assert.

  t.deepEqual([...registry], []);
  t.deepEqual([...registry.bindings()], []);

  // Act.

  registry.set("id", null, a);

  // Assert.

  t.deepEqual([...registry], [["id", null, a]]);
  t.deepEqual([...registry.bindings()], [a]);

  // Act.

  registry.set("id", "b", b);
  registry.set("id", "c", c);

  // Assert.

  t.deepEqual(
    [...registry],
    [
      ["id", null, a],
      ["id", "b", b],
      ["id", "c", c],
    ],
  );
  t.deepEqual([...registry.bindings()], [a, b, c]);
  t.false(registry.has("x", null));
  t.is(registry.get("x", null), null);
  t.true(registry.has("id", null));
  t.is(registry.get("id", null), a);
  t.true(registry.has("id", "b"));
  t.is(registry.get("id", "b"), b);
  t.true(registry.has("id", "c"));
  t.is(registry.get("id", "c"), c);
  t.false(registry.has("id", "x"));

  // Act.

  registry.set("id", null, x);
  registry.set("id", "b", x);
  registry.set("id", "c", x);

  // Assert.

  t.deepEqual(
    [...registry],
    [
      ["id", null, x],
      ["id", "b", x],
      ["id", "c", x],
    ],
  );
  t.deepEqual([...registry.bindings()], [x, x, x]);

  // Act.

  registry.delete("id", null);

  // Assert.

  t.deepEqual(
    [...registry],
    [
      ["id", "b", x],
      ["id", "c", x],
    ],
  );
  t.deepEqual([...registry.bindings()], [x, x]);

  // Act.

  registry.clear();

  // Assert.

  t.deepEqual([...registry], []);
  t.deepEqual([...registry.bindings()], []);
});
