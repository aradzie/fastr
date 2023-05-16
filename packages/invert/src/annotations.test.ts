import test from "ava";
import { inject, injectable, prop, provides } from "./annotations.js";
import { type Binder, type Module } from "./types.js";

test("report duplicate @injectable annotation", (t) => {
  t.throws(
    () => {
      @injectable()
      @injectable()
      class Demo {
        constructor() {}
      }
    },
    { message: "Duplicate annotation @injectable" },
  );
});

test("report duplicate @inject annotation", (t) => {
  t.throws(
    () => {
      @injectable()
      class Demo {
        constructor(@inject("foo") @inject("bar") foo: string) {}
      }
    },
    { message: "Duplicate annotation @inject" },
  );
});

test("report duplicate @prop annotation", (t) => {
  t.throws(
    () => {
      @injectable()
      class Demo {
        @prop({ id: "foo" }) @prop({ id: "bar" }) private readonly foo!: string;
        constructor() {}
      }
    },
    { message: "Duplicate annotation @prop" },
  );
});

test("report duplicate @provides annotation", (t) => {
  t.throws(
    () => {
      class Foo implements Module {
        configure(binder: Binder): void {}
        @provides()
        @provides()
        providesFoo(): string {
          return "foo";
        }
      }
    },
    { message: "Duplicate annotation @provides" },
  );
});
