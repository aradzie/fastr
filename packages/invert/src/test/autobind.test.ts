import test from "ava";
import { Container, injectable } from "../index.js";

test("auto bind injectables", (t) => {
  @injectable()
  class A {}

  @injectable()
  class B {
    constructor(readonly a: A) {}
  }

  @injectable()
  class C {
    constructor(readonly b: B) {}
  }

  const container = new Container();

  t.false(container.has(A));
  t.false(container.has(B));
  t.false(container.has(C));

  const a = container.get(A);
  const b = container.get(B);
  const c = container.get(C);

  t.true(a instanceof A);
  t.true(b instanceof B);
  t.true(b.a instanceof A);
  t.true(c instanceof C);
  t.true(c.b instanceof B);
  t.true(c.b.a instanceof A);

  t.true(container.has(A));
  t.true(container.has(B));
  t.true(container.has(C));
});
