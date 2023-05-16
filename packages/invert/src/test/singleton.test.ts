import test from "ava";
import {
  type Binder,
  Container,
  injectable,
  type Module,
  provides,
} from "../index.js";

test("get singletons", (t) => {
  @injectable({ singleton: false })
  class A {
    constructor() {}
  }

  @injectable({ singleton: true })
  class B {
    constructor() {}
  }

  @injectable()
  class C {
    constructor() {}
  }

  @injectable()
  class D {
    constructor() {}
  }

  class Demo implements Module {
    configure({ bind }: Binder): void {
      bind(A).toSelf();
      bind(B).toSelf();
    }

    @provides({ singleton: false })
    provideC(): C {
      return new C();
    }

    @provides({ singleton: true })
    provideD(): D {
      return new D();
    }
  }

  const container = new Container();

  container.load(new Demo());

  t.not(container.get(A), container.get(A));
  t.not(container.get(A), container.get(A));
  t.is(container.get(B), container.get(B));
  t.is(container.get(B), container.get(B));
  t.not(container.get(C), container.get(C));
  t.not(container.get(C), container.get(C));
  t.is(container.get(D), container.get(D));
  t.is(container.get(D), container.get(D));
});
