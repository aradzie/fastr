import test from "ava";
import { type Reflector, reflectorOf } from "./reflector.js";

const classDec = () => {
  return (<T extends abstract new (...args: any) => unknown>(
    target: T,
  ): void => {}) as ClassDecorator;
};

const paramDec = <T = unknown>() => {
  return ((
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void => {}) as ParameterDecorator;
};

const propDec = <T = unknown>() => {
  return ((target: object, propertyKey: string | symbol): void => {
    reflectorOf.addPropertyKey(target, propertyKey);
  }) as PropertyDecorator;
};

const methodDec = () => {
  return ((
    target: object,
    propertyKey: string | symbol,
  ): void => {}) as MethodDecorator;
};

@classDec()
class Base {
  static staticProp1 = "staticProp1";

  static staticMethod1() {}

  static {} // eslint-disable-line no-empty-static-block

  #privateProp1 = "x";
  #privateProp2 = "y";

  @propDec() baseProp1!: string;
  @propDec() baseProp2!: number;

  @methodDec()
  baseMethod1(@paramDec() a: string): string {
    return a;
  }

  @methodDec()
  baseMethod2(@paramDec() b: number): number {
    return b;
  }
}

@classDec()
class Demo extends Base {
  static override staticProp1 = "staticProp1";
  static staticProp2 = "staticProp2";

  static override staticMethod1() {}

  static staticMethod2() {}

  static {} // eslint-disable-line no-empty-static-block

  #privateProp1 = "x";
  #privateProp2 = "y";

  @propDec() prop1!: string;
  @propDec() prop2!: number;

  constructor(
    @paramDec() readonly a: string,
    @paramDec() readonly b: number,
  ) {
    super();
  }

  @methodDec()
  method1(@paramDec() a: string): string {
    return a;
  }

  @methodDec()
  method2(@paramDec() b: number): number {
    return b;
  }
}

test("return cached reflector", (t) => {
  t.is(reflectorOf(Object), reflectorOf(Object));
  t.is(reflectorOf(Demo), reflectorOf(Demo));
});

test("reflect Object", (t) => {
  const ref = reflectorOf(Object);

  t.is(ref.base, null);
  t.is(ref.newable, Object);
  t.deepEqual(ref.paramTypes, []);

  const instance = ref.construct(null);
  t.true(instance != null);
});

test("reflect custom class", (t) => {
  const ref = reflectorOf(Demo);

  t.not(ref.base, null);
  t.is(ref.newable, Demo);
  t.deepEqual(ref.paramTypes, [String, Number]);

  const instance = ref.construct("a", 1);
  t.is(instance.constructor, Demo);

  t.deepEqual(Object.keys(ref.properties), ["prop1", "prop2"]);
  const p1 = ref.properties["prop1"];
  const p2 = ref.properties["prop2"];
  t.like(p1, {
    key: "prop1",
    type: String,
  });
  t.like(p2, {
    key: "prop2",
    type: Number,
  });
  t.is(p1.get(instance), undefined);
  t.is(p2.get(instance), undefined);
  p1.set(instance, "a");
  p2.set(instance, 1);
  t.is(p1.get(instance), "a");
  t.is(p2.get(instance), 1);
  t.is(instance.prop1, "a");
  t.is(instance.prop2, 1);

  t.deepEqual(Object.keys(ref.methods), ["method1", "method2"]);
  const m1 = ref.methods["method1"];
  const m2 = ref.methods["method2"];
  t.like(m1, {
    key: "method1",
    type: Function,
    paramTypes: [String],
    returnType: String,
  });
  t.like(m2, {
    key: "method2",
    type: Function,
    paramTypes: [Number],
    returnType: Number,
  });
  t.is(m1.apply(instance, "a"), "a");
  t.is(m2.apply(instance, 1), 1);
});

test("reflect custom class base", (t) => {
  const ref = reflectorOf(Demo).base as Reflector;

  t.is(ref.base, null);
  t.is(ref.newable, Base);
  t.deepEqual(ref.paramTypes, []);

  t.deepEqual(Object.keys(ref.properties), ["baseProp1", "baseProp2"]);
  t.deepEqual(Object.keys(ref.methods), ["baseMethod1", "baseMethod2"]);
});

test("inherited constructor parameters", (t) => {
  @classDec()
  class A {
    constructor(a: string, b: number) {}
  }

  @classDec()
  class B extends A {}

  const a = reflectorOf(A);
  t.is(a.newable, A);
  t.is(a.newable.length, 2);
  t.deepEqual(a.paramTypes, [String, Number]);

  const b = reflectorOf(B);
  t.is(b.newable, B);
  t.is(b.newable.length, 0);
  t.deepEqual(b.paramTypes, []);
});

test("inherited properties", (t) => {
  @classDec()
  class A {
    @propDec() declare a: string;
    @propDec() declare b: string;
    @propDec() declare c: string;
  }

  @classDec()
  class B extends A {
    @propDec() declare a: string;
    @propDec() declare b: string;
    @propDec() declare x: string;
  }

  @classDec()
  class C extends B {
    @propDec() declare c: string;
    @propDec() declare z: string;
  }

  {
    const properties = reflectorOf(A).allProperties;
    t.is(Object.keys(properties).length, 3);
    const { a, b, c } = properties;
    t.is(a.key, "a");
    t.is(b.key, "b");
    t.is(c.key, "c");
  }

  {
    const properties = reflectorOf(B).allProperties;
    t.is(Object.keys(properties).length, 4);
    const { a, b, c, x } = properties;
    t.is(a.key, "a");
    t.is(b.key, "b");
    t.is(c.key, "c");
    t.is(x.key, "x");
  }

  {
    const properties = reflectorOf(C).allProperties;
    t.is(Object.keys(properties).length, 5);
    const { a, b, c, x, z } = properties;
    t.is(a.key, "a");
    t.is(b.key, "b");
    t.is(c.key, "c");
    t.is(x.key, "x");
    t.is(z.key, "z");
  }
});

test("inherited methods", (t) => {
  @classDec()
  class A {
    @methodDec() a() {}
    @methodDec() b() {}
    @methodDec() c() {}
  }

  @classDec()
  class B extends A {
    @methodDec() override b() {}
    @methodDec() override c() {}
    @methodDec() y() {}
  }

  @classDec()
  class C extends B {
    @methodDec() override c() {}
    @methodDec() z() {}
  }

  {
    const methods = reflectorOf(A).allMethods;
    t.is(Object.keys(methods).length, 3);
    const { a, b, c } = methods;
    t.is(a.key, "a");
    t.is(b.key, "b");
    t.is(c.key, "c");
    t.is(a.value, A.prototype.a);
    t.is(b.value, A.prototype.b);
    t.is(c.value, A.prototype.c);
  }

  {
    const methods = reflectorOf(B).allMethods;
    t.is(Object.keys(methods).length, 4);
    const { a, b, c, y } = methods;
    t.is(a.key, "a");
    t.is(b.key, "b");
    t.is(c.key, "c");
    t.is(y.key, "y");
    t.is(a.value, A.prototype.a);
    t.is(b.value, B.prototype.b);
    t.is(c.value, B.prototype.c);
    t.is(y.value, B.prototype.y);
  }

  {
    const methods = reflectorOf(C).allMethods;
    t.is(Object.keys(methods).length, 5);
    const { a, b, c, y, z } = methods;
    t.is(a.key, "a");
    t.is(b.key, "b");
    t.is(c.key, "c");
    t.is(y.key, "y");
    t.is(z.key, "z");
    t.is(a.value, A.prototype.a);
    t.is(b.value, B.prototype.b);
    t.is(c.value, C.prototype.c);
    t.is(y.value, B.prototype.y);
    t.is(z.value, C.prototype.z);
  }
});

test("mutate metadata", (t) => {
  const ref = reflectorOf(Demo);
  const baseRef = ref.base!;

  {
    const k0 = Symbol("k0");
    const k1 = Symbol("k1");

    t.false(ref.hasOwnMetadata(k0));
    t.false(ref.hasOwnMetadata(k1));
    t.is(ref.getOwnMetadata(k0), undefined);
    t.is(ref.getOwnMetadata(k1), undefined);
    t.false(baseRef.hasOwnMetadata(k0));
    t.false(baseRef.hasOwnMetadata(k1));
    t.is(baseRef.getOwnMetadata(k0), undefined);
    t.is(baseRef.getOwnMetadata(k1), undefined);

    ref.setMetadata(k0, "a0");
    ref.setMetadata(k1, "a1");

    t.true(ref.hasOwnMetadata(k0));
    t.true(ref.hasOwnMetadata(k1));
    t.is(ref.getOwnMetadata(k0), "a0");
    t.is(ref.getOwnMetadata(k1), "a1");
    t.false(baseRef.hasOwnMetadata(k0));
    t.false(baseRef.hasOwnMetadata(k1));
    t.is(baseRef.getOwnMetadata(k0), undefined);
    t.is(baseRef.getOwnMetadata(k1), undefined);

    baseRef.setMetadata(k0, "b0");
    baseRef.setMetadata(k1, "b1");

    t.true(ref.hasOwnMetadata(k0));
    t.true(ref.hasOwnMetadata(k1));
    t.is(ref.getOwnMetadata(k0), "a0");
    t.is(ref.getOwnMetadata(k1), "a1");
    t.true(baseRef.hasOwnMetadata(k0));
    t.true(baseRef.hasOwnMetadata(k1));
    t.is(baseRef.getOwnMetadata(k0), "b0");
    t.is(baseRef.getOwnMetadata(k1), "b1");
  }

  {
    const k0 = Symbol("prop1k0");
    const k1 = Symbol("prop1k1");
    const p1 = ref.properties["prop1"];

    t.false(p1.hasOwnMetadata(k0));
    t.false(p1.hasOwnMetadata(k1));
    t.is(p1.getOwnMetadata(k0), undefined);
    t.is(p1.getOwnMetadata(k1), undefined);

    p1.setMetadata(k0, "a0");
    p1.setMetadata(k1, "a1");

    t.true(p1.hasOwnMetadata(k0));
    t.true(p1.hasOwnMetadata(k1));
    t.is(p1.getOwnMetadata(k0), "a0");
    t.is(p1.getOwnMetadata(k1), "a1");
  }

  {
    const k0 = Symbol("method1k0");
    const k1 = Symbol("method1k1");
    const m1 = ref.methods["method1"];

    t.false(m1.hasOwnMetadata(k0));
    t.false(m1.hasOwnMetadata(k1));
    t.is(m1.getOwnMetadata(k0), undefined);
    t.is(m1.getOwnMetadata(k1), undefined);

    m1.setMetadata(k0, "a0");
    m1.setMetadata(k1, "a1");

    t.true(m1.hasOwnMetadata(k0));
    t.true(m1.hasOwnMetadata(k1));
    t.is(m1.getOwnMetadata(k0), "a0");
    t.is(m1.getOwnMetadata(k1), "a1");
  }
});
