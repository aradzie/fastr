import test from "ava";
import {
  type Binder,
  Container,
  ContainerError,
  inject,
  injectable,
  type Module,
  prop,
  provides,
} from "./index.js";

test("auto-bind off", (t) => {
  @injectable()
  class A {}

  @injectable()
  class B {
    constructor(readonly a: A) {}
  }

  const container = new Container({ autoBindInjectable: false });

  t.true(container.has(Container));
  t.is(container.get(Container), container);

  container.bind(B).toSelf();

  t.false(container.has(A));
  t.true(container.has(B));

  t.throws(
    () => {
      container.get(A);
    },
    {
      instanceOf: ContainerError,
    },
  );
  t.throws(
    () => {
      container.get(B);
    },
    {
      instanceOf: ContainerError,
    },
  );

  t.false(container.has(A));
  t.true(container.has(B));
});

test("auto-bind on", (t) => {
  @injectable()
  class A {}

  @injectable()
  class B {
    constructor(readonly a: A) {}
  }

  const container = new Container();

  t.true(container.has(Container));
  t.is(container.get(Container), container);

  t.false(container.has(A));
  t.false(container.has(B));

  t.true(container.get(A) instanceof A);
  t.true(container.get(B) instanceof B);
  t.true(container.get(B).a instanceof A);

  t.true(container.has(A));
  t.true(container.has(B));
});

test("auto-bind with named dependencies", (t) => {
  const id = Symbol();

  @injectable()
  class A {}

  @injectable()
  class B {
    constructor(@inject(A, { name: id }) readonly a: A) {}
  }

  const container = new Container({ autoBindInjectable: true });

  t.false(container.has(A));
  t.false(container.has(A, id));
  t.false(container.has(B));
  t.true(container.get(A) instanceof A);
  t.throws(
    () => {
      container.get(B);
    },
    {
      instanceOf: ContainerError,
    },
  );
  t.true(container.has(A));
  t.false(container.has(A, id));
  t.true(container.has(B));
});

test("constructor and property injection", (t) => {
  @injectable()
  abstract class Base {}

  @injectable()
  class Demo extends Base {
    @prop({ name: "a" }) readonly a!: string;
    @prop({ name: "b" }) readonly b!: string;

    constructor(
      @inject(String, { name: "c" }) readonly c: string,
      @inject(String, { name: "d" }) readonly d: string,
    ) {
      super();
    }
  }

  const container = new Container();
  container.bind(String, "a").toValue("A");
  container.bind(String, "b").toValue("B");
  container.bind(String, "c").toValue("C");
  container.bind(String, "d").toValue("D");

  const demo = container.get(Demo);

  t.is(demo.a, "A");
  t.is(demo.b, "B");
  t.is(demo.c, "C");
  t.is(demo.d, "D");
});

test("singletons", (t) => {
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

  class TestModule implements Module {
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

  container.load(new TestModule());

  t.not(container.get(A), container.get(A));
  t.is(container.get(B), container.get(B));
  t.not(container.get(C), container.get(C));
  t.is(container.get(D), container.get(D));
});

test("providers", (t) => {
  class TestModule implements Module {
    configure(binder: Binder): void {}

    @provides({ id: "abc" })
    provideX(): string {
      return "X";
    }

    @provides({ id: "abc", name: "y" })
    provideY(): string {
      return "Y";
    }

    @provides({ id: "abc", name: "z" })
    provideZ(): string {
      return "Z";
    }

    @provides({ name: "name" })
    provideStringValue(): string {
      return "value";
    }

    @provides({ name: "name" })
    provideNumberValue(): number {
      return 123;
    }
  }

  const container = new Container();

  container.load(new TestModule());

  t.true(container.has("abc"));
  t.is(container.get("abc"), "X");
  t.true(container.has("abc", "y"));
  t.is(container.get("abc", "y"), "Y");
  t.true(container.has("abc", "z"));
  t.is(container.get("abc", "z"), "Z");
  t.true(container.has(String, "name"));
  t.is(container.get(String, "name"), "value");
  t.true(container.has(Number, "name"));
  t.is(container.get(Number, "name"), 123);
});

test("container hierarchy", (t) => {
  const id = Symbol();

  const parent = new Container({ autoBindInjectable: false });
  const child1 = parent.createChild();
  const child2 = parent.createChild();

  t.false(parent.has(id));
  t.false(child1.has(id));
  t.false(child2.has(id));

  child1.bind(id).toValue(1);

  t.false(parent.has(id));
  t.true(child1.has(id));
  t.false(child2.has(id));

  parent.bind(id).toValue(2);

  t.true(parent.has(id));
  t.true(child1.has(id));
  t.true(child2.has(id));

  t.is(parent.get(id), 2);
  t.is(child1.get(id), 1);
  t.is(child2.get(id), 2);

  child2.bind(id).toValue(3);

  t.true(parent.has(id));
  t.true(child1.has(id));
  t.true(child2.has(id));

  t.is(parent.get(id), 2);
  t.is(child1.get(id), 1);
  t.is(child2.get(id), 3);
});

test.skip("inherit constructor parameters", (t) => {
  @injectable()
  abstract class Base {
    constructor(@inject("val") readonly val: string) {}
  }

  @injectable()
  class Demo1 extends Base {}

  @injectable()
  class Demo2 extends Base {}

  const container = new Container();

  container.bind("val", "xyz").to(Demo1);
  container.bind(Base, "c1").to(Demo1);
  container.bind(Base, "c2").to(Demo2);

  const c1 = container.get(Base, "c1");
  const c2 = container.get(Base, "c2");

  t.true(c1 instanceof Demo1);
  t.true(c2 instanceof Demo2);
  t.is(c1.val, "c1");
  t.is(c2.val, "c2");
});

test("load modules", (t) => {
  class TestModule1 implements Module {
    configure(binder: Binder): void {
      binder.bind("a").toValue(1);
    }

    @provides({ name: "x" }) val(): string {
      return "abc";
    }
  }

  class TestModule2 implements Module {
    configure(binder: Binder): void {
      binder.load(new TestModule1());
      binder.bind("b").toValue(2);
    }

    @provides({ name: "x" }) val(): number {
      return 123;
    }
  }

  class TestModule3 implements Module {
    configure(binder: Binder): void {
      binder.load(new TestModule2());
      binder.bind("c").toValue(3);
    }

    @provides({ name: "x" }) val(): boolean {
      return true;
    }
  }

  const container = new Container();

  container.load(new TestModule3());

  t.is(container.get("a"), 1);
  t.is(container.get("b"), 2);
  t.is(container.get("c"), 3);
  t.is(container.get(String, "x"), "abc");
  t.is(container.get(Number, "x"), 123);
  t.is(container.get(Boolean, "x"), true);
});

test("check arguments", (t) => {
  const container = new Container();

  t.throws(
    () => {
      container.bind(null as any, null);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      container.bind(Object as any, null);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      container.has(null as any, null);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      container.has(Object as any, null);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      container.get(null as any, null);
    },
    { instanceOf: TypeError },
  );
  t.throws(
    () => {
      container.get(Object as any, null);
    },
    { instanceOf: TypeError },
  );
});
