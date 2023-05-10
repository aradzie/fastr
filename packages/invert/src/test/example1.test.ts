import test from "ava";
import {
  type Binder,
  Container,
  injectable,
  type Module,
  provides,
} from "../index.js";

@injectable()
class ServiceA {
  run(): string {
    return "haha";
  }
}

@injectable()
class ServiceB {
  constructor(private readonly a: ServiceA) {}

  run(): string {
    return this.a.run() + "/hoho";
  }
}

class ModuleA implements Module {
  configure({ bind }: Binder): void {
    bind(ServiceA).toSelf();
  }
}

class ModuleB implements Module {
  configure({ bind }: Binder): void {
    bind(ServiceB).to(ServiceB);
  }
}

class ModuleC implements Module {
  configure({ bind }: Binder): void {
    bind(String).toValue("OMG");
    bind(String, "abc").toValue("ABC");
    bind(String, "xyz").toValue("XYZ");
  }
}

class MyModule implements Module {
  configure({ load }: Binder): void {
    load(new ModuleA());
    load(new ModuleB());
    load(new ModuleC());
  }

  @provides({ id: "canonicalUrl" })
  provideCanonicalUrl(): string {
    return "http://root/";
  }

  @provides({ id: "something" })
  provideSomething(service: ServiceB): string {
    return `[${service.run()}]`;
  }
}

test("example", (t) => {
  const container = new Container();
  container.load(new MyModule());

  t.is(container.get(ServiceA).run(), "haha");
  t.is(container.get(ServiceB).run(), "haha/hoho");
  t.is(container.get("canonicalUrl"), "http://root/");
  t.is(container.get("something"), "[haha/hoho]");
  t.is(container.get(String), "OMG");
  t.is(container.get(String, "abc"), "ABC");
  t.is(container.get(String, "xyz"), "XYZ");
});
