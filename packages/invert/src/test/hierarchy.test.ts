import test from "ava";
import { Container } from "../container.js";

test("first resolve in the children then in the parent", (t) => {
  const p = new Container();
  const c1 = p.createChild();
  const c2 = p.createChild();

  t.false(p.has("x"));
  t.false(c1.has("x"));
  t.false(c2.has("x"));

  c1.bind("x").toValue(1);

  t.false(p.has("x"));
  t.true(c1.has("x"));
  t.false(c2.has("x"));

  p.bind("x").toValue(2);

  t.true(p.has("x"));
  t.true(c1.has("x"));
  t.true(c2.has("x"));

  t.is(p.get("x"), 2);
  t.is(c1.get("x"), 1);
  t.is(c2.get("x"), 2);

  c2.bind("x").toValue(3);

  t.true(p.has("x"));
  t.true(c1.has("x"));
  t.true(c2.has("x"));

  t.is(p.get("x"), 2);
  t.is(c1.get("x"), 1);
  t.is(c2.get("x"), 3);
});
