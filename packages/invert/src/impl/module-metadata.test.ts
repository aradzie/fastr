import test from "ava";
import { inject, provides } from "../annotations.js";
import { type Binder, type Module } from "../types.js";
import { getProviders } from "./module-metadata.js";
import { type ProviderMetadata } from "./types.js";

test("empty module", (t) => {
  class Foo implements Module {
    configure(binder: Binder): void {}
  }

  const foo = new Foo();

  t.deepEqual([...getProviders(foo)], [] satisfies ProviderMetadata[]);
});

test("basic annotation", (t) => {
  class Foo implements Module {
    configure(binder: Binder): void {}
    @provides()
    provideFoo(): string {
      return "foo";
    }
  }

  const foo = new Foo();

  t.deepEqual([...getProviders(foo)], [
    {
      type: String,
      id: String,
      name: null,
      singleton: false,
      module: foo,
      callable: foo.provideFoo,
      params: [],
    },
  ] satisfies ProviderMetadata[]);
});

test("annotation with options without id", (t) => {
  class Foo implements Module {
    configure(binder: Binder): void {}
    @provides({ name: "a", singleton: true })
    provideFoo(): string {
      return "foo";
    }
  }

  const foo = new Foo();

  t.deepEqual([...getProviders(foo)], [
    {
      type: String,
      id: String,
      name: "a",
      singleton: true,
      module: foo,
      callable: foo.provideFoo,
      params: [],
    },
  ] satisfies ProviderMetadata[]);
});

test("annotation with options with id", (t) => {
  class Foo implements Module {
    configure(binder: Binder): void {}
    @provides({ id: "foo", name: "a", singleton: true })
    provideFoo(): string {
      return "foo";
    }
  }

  const foo = new Foo();

  t.deepEqual([...getProviders(foo)], [
    {
      type: String,
      id: "foo",
      name: "a",
      singleton: true,
      module: foo,
      callable: foo.provideFoo,
      params: [],
    },
  ] satisfies ProviderMetadata[]);
});

test("with params", (t) => {
  class Foo implements Module {
    configure(binder: Binder): void {}
    @provides({ id: "foo", name: "a", singleton: true })
    provideFoo(@inject("bar", { name: "b" }) bar: string): string {
      return "foo";
    }
  }

  const foo = new Foo();

  t.deepEqual([...getProviders(foo)], [
    {
      type: String,
      id: "foo",
      name: "a",
      singleton: true,
      module: foo,
      callable: foo.provideFoo,
      params: [
        {
          index: 0,
          type: String,
          id: "bar",
          name: "b",
        },
      ],
    },
  ] satisfies ProviderMetadata[]);
});
