import test from "ava";
import { inject, injectable } from "../annotations.js";
import { Container } from "../container.js";

test.skip("inherit constructor parameters", (t) => {
  @injectable()
  abstract class Base {
    constructor(@inject("tag") readonly tag: string) {}
  }

  @injectable()
  class C1 extends Base {}

  @injectable()
  class C2 extends Base {}

  const container = new Container();

  container.bind("tag", "tag").to(C1);
  container.bind(Base, "c1").to(C1);
  container.bind(Base, "c2").to(C2);

  const c1 = container.get(Base, "c1");
  const c2 = container.get(Base, "c2");

  t.true(c1 instanceof C1);
  t.true(c2 instanceof C2);
  t.is(c1.tag, "c1");
  t.is(c2.tag, "c2");
});
