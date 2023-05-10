import test from "ava";
import { provides } from "../annotations.js";
import { Container } from "../container.js";
import { type Binder, type Module } from "../types.js";

test("get provided values", (t) => {
  class Module1 implements Module {
    configure(binder: Binder): void {}

    @provides({ id: "abc" })
    provideX(): string {
      return "X";
    }
  }

  class Module2 implements Module {
    configure(binder: Binder): void {}

    @provides({ id: "abc", name: "y" })
    provideY(): string {
      return "Y";
    }

    @provides({ id: "abc", name: "z" })
    provideZ(): string {
      return "Z";
    }
  }

  class Module3 implements Module {
    configure(binder: Binder): void {}

    @provides({ name: "name" })
    provideStringValue(): string {
      return "value";
    }

    @provides({ name: "name" })
    provideNumberValue(): number {
      return 123;
    }
  }

  const container = new Container()
    .load(new Module1())
    .load(new Module2())
    .load(new Module3());

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
