import test from "ava";
import { inject, injectable, prop } from "../annotations.js";
import { getClassMetadata } from "./class-metadata.js";
import { type ClassMetadata } from "./types.js";

test("simple class", (t) => {
  class Foo {
    constructor() {}
  }

  t.deepEqual(getClassMetadata(Foo), {
    id: null,
    name: null,
    singleton: false,
    props: [],
    newable: Foo,
    params: [],
  } satisfies ClassMetadata);
});

test("annotated class", (t) => {
  @injectable({ id: "foo", singleton: true })
  class Foo {
    constructor() {}
  }

  t.deepEqual(getClassMetadata(Foo), {
    id: "foo",
    name: null,
    singleton: true,
    props: [],
    newable: Foo,
    params: [],
  } satisfies ClassMetadata);
});

test("simple class with props", (t) => {
  class Foo {
    @prop({ id: "x" }) private readonly a!: string;
    @prop({ id: "y" }) private readonly b!: string;
    constructor() {}
  }

  t.deepEqual(getClassMetadata(Foo), {
    id: null,
    name: null,
    singleton: false,
    props: [
      { propertyKey: "a", type: String, id: "x", name: null },
      { propertyKey: "b", type: String, id: "y", name: null },
    ],
    newable: Foo,
    params: [],
  } satisfies ClassMetadata);
});

test("annotated class with props", (t) => {
  @injectable({ id: "foo", name: "a", singleton: true })
  class Foo {
    @prop({ id: "x" }) private readonly a!: string;
    @prop({ id: "y" }) private readonly b!: string;
    constructor() {}
  }

  t.deepEqual(getClassMetadata(Foo), {
    id: "foo",
    name: "a",
    singleton: true,
    props: [
      { propertyKey: "a", type: String, id: "x", name: null },
      { propertyKey: "b", type: String, id: "y", name: null },
    ],
    newable: Foo,
    params: [],
  } satisfies ClassMetadata);
});

test("simple class with annotated parameters", (t) => {
  class Foo {
    constructor(
      @inject("foo", { name: "a" }) x: string,
      @inject("bar", { name: "b" }) y: number,
    ) {}
  }

  t.deepEqual(getClassMetadata(Foo), {
    id: null,
    name: null,
    singleton: false,
    props: [],
    newable: Foo,
    params: [
      { index: 0, type: String, id: "foo", name: "a" },
      { index: 1, type: Number, id: "bar", name: "b" },
    ],
  } satisfies ClassMetadata);
});

test("annotated class with simple parameters", (t) => {
  @injectable({ id: "foo", name: "a", singleton: true })
  class Foo {
    constructor(x: string, y: number) {}
  }

  t.deepEqual(getClassMetadata(Foo), {
    id: "foo",
    name: "a",
    singleton: true,
    props: [],
    newable: Foo,
    params: [
      { index: 0, type: String, id: String, name: null },
      { index: 1, type: Number, id: Number, name: null },
    ],
  } satisfies ClassMetadata);
});

test("annotated class with annotated parameters with props", (t) => {
  @injectable({ id: "foo", singleton: true })
  class Foo {
    @prop({ id: "x", name: "a" }) private readonly a!: string;
    @prop({ id: "y", name: "b" }) private readonly b!: string;
    constructor(@inject("baz") x: string, @inject("bar") y: number) {}
  }

  t.deepEqual(getClassMetadata(Foo), {
    id: "foo",
    name: null,
    singleton: true,
    props: [
      { propertyKey: "a", type: String, id: "x", name: "a" },
      { propertyKey: "b", type: String, id: "y", name: "b" },
    ],
    newable: Foo,
    params: [
      { index: 0, type: String, id: "baz", name: null },
      { index: 1, type: Number, id: "bar", name: null },
    ],
  } satisfies ClassMetadata);
});
