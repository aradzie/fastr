import test from "ava";
import "reflect-metadata";
import { reflector } from "./reflector.js";

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
    reflector.addProperty(target, propertyKey);
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
  t.is(reflector(Demo), reflector(Demo));
  t.is(reflector(Demo), reflector(Demo));
});

test("reflect", (t) => {
  const r = reflector(Demo);
  const demo = r.construct("a", 1);

  t.is(r.newable, Demo);
  t.deepEqual(r.paramTypes, [String, Number]);

  t.deepEqual(Object.keys(r.properties), ["prop1", "prop2"]);
  const p1 = r.properties["prop1"];
  const p2 = r.properties["prop2"];
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

  t.deepEqual(Object.keys(r.methods), ["method1", "method2"]);
  const m1 = r.methods["method1"];
  const m2 = r.methods["method2"];
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
  const r = reflector(Demo);

  t.false(r.hasMetadata("m0"));
  t.false(r.hasMetadata("m1"));
  t.is(r.getMetadata("m0"), undefined);
  t.is(r.getMetadata("m1"), undefined);
  r.setMetadata("m0", "v0");
  r.setMetadata("m1", "v1");
  t.true(r.hasMetadata("m0"));
  t.true(r.hasMetadata("m1"));
  t.is(r.getMetadata("m0"), "v0");
  t.is(r.getMetadata("m1"), "v1");

  {
    const p1 = r.properties["prop1"];
    t.false(p1.hasMetadata("m0"));
    t.false(p1.hasMetadata("m1"));
    t.is(p1.getMetadata("m0"), undefined);
    t.is(p1.getMetadata("m1"), undefined);
    p1.setMetadata("m0", "v0");
    p1.setMetadata("m1", "v1");
    t.true(p1.hasMetadata("m0"));
    t.true(p1.hasMetadata("m1"));
    t.is(p1.getMetadata("m0"), "v0");
    t.is(p1.getMetadata("m1"), "v1");
  }

  {
    const m1 = r.methods["method1"];
    t.false(m1.hasMetadata("m0"));
    t.false(m1.hasMetadata("m1"));
    t.is(m1.getMetadata("m0"), undefined);
    t.is(m1.getMetadata("m1"), undefined);
    m1.setMetadata("m0", "v0");
    m1.setMetadata("m1", "v1");
    t.true(m1.hasMetadata("m0"));
    t.true(m1.hasMetadata("m1"));
    t.is(m1.getMetadata("m0"), "v0");
    t.is(m1.getMetadata("m1"), "v1");
  }
});
