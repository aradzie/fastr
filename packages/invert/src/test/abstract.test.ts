import test from "ava";
import { Container } from "../container.js";

test("id", (t) => {
  abstract class Base {
    constructor(readonly tag: string) {}
  }
  class C1 extends Base {
    private constructor() {
      super("c1");
    }
  }
  class C2 extends Base {
    private constructor() {
      super("c2");
    }
  }

  const container = new Container();

  container.bind(Base, "c1").to(C1);
  container.bind(Base, "c2").to(C2);

  const c1 = container.get(Base, "c1");
  const c2 = container.get(Base, "c2");

  t.true(c1 instanceof C1);
  t.true(c2 instanceof C2);
  t.is(c1.tag, "c1");
  t.is(c2.tag, "c2");
});
