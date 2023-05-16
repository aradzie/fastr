import test from "ava";
import { reflectorOf } from "./reflector.js";

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
class Demo {
  @propDec() prop1!: string;
  @propDec() prop2!: number;

  constructor(@paramDec() readonly a: string, @paramDec() readonly b: number) {}

  @methodDec()
  method1(@paramDec() a: string): string {
    return this.a + a;
  }

  @methodDec()
  method2(@paramDec() b: number): number {
    return this.b + b;
  }
}

test("return cached reflector", (t) => {
  t.is(reflectorOf(Demo), reflectorOf(Demo));
  t.is(reflectorOf(Demo), reflectorOf(Demo));
});

test("reflect", (t) => {
  const ref = reflectorOf(Demo);
  const demo = ref.construct("a", 1);

  t.is(ref.newable, Demo);
  t.deepEqual(ref.paramTypes, [String, Number]);

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
  t.is(p1.get(demo), undefined);
  t.is(p2.get(demo), undefined);
  p1.set(demo, "a");
  p2.set(demo, 1);
  t.is(p1.get(demo), "a");
  t.is(p2.get(demo), 1);
  t.is(demo.prop1, "a");
  t.is(demo.prop2, 1);

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
  t.is(m1.apply(demo, "b"), "ab");
  t.is(m2.apply(demo, 2), 3);
});

test("metadata", (t) => {
  const ref = reflectorOf(Demo);

  {
    const k0 = Symbol("k0");
    const k1 = Symbol("k1");
    t.false(ref.hasMetadata(k0));
    t.false(ref.hasMetadata(k1));
    t.is(ref.getMetadata(k0), undefined);
    t.is(ref.getMetadata(k1), undefined);
    ref.setMetadata(k0, "v0");
    ref.setMetadata(k1, "v1");
    t.true(ref.hasMetadata(k0));
    t.true(ref.hasMetadata(k1));
    t.is(ref.getMetadata(k0), "v0");
    t.is(ref.getMetadata(k1), "v1");
  }

  {
    const k0 = Symbol("prop1k0");
    const k1 = Symbol("prop1k1");
    const p1 = ref.properties["prop1"];
    t.false(p1.hasMetadata(k0));
    t.false(p1.hasMetadata(k1));
    t.is(p1.getMetadata(k0), undefined);
    t.is(p1.getMetadata(k1), undefined);
    p1.setMetadata(k0, "v0");
    p1.setMetadata(k1, "v1");
    t.true(p1.hasMetadata(k0));
    t.true(p1.hasMetadata(k1));
    t.is(p1.getMetadata(k0), "v0");
    t.is(p1.getMetadata(k1), "v1");
  }

  {
    const k0 = Symbol("method1k0");
    const k1 = Symbol("method1k1");
    const m1 = ref.methods["method1"];
    t.false(m1.hasMetadata(k0));
    t.false(m1.hasMetadata(k1));
    t.is(m1.getMetadata(k0), undefined);
    t.is(m1.getMetadata(k1), undefined);
    m1.setMetadata(k0, "v0");
    m1.setMetadata(k1, "v1");
    t.true(m1.hasMetadata(k0));
    t.true(m1.hasMetadata(k1));
    t.is(m1.getMetadata(k0), "v0");
    t.is(m1.getMetadata(k1), "v1");
  }
});
