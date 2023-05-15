import test from "ava";
import { Container, inject, injectable, prop } from "../index.js";

test("constructor and property injection", (t) => {
  @injectable()
  class Demo {
    @prop({ name: "a" }) readonly a!: string;
    @prop({ name: "b" }) readonly b!: string;

    constructor(
      @inject(String, { name: "c" }) readonly c: string,
      @inject(String, { name: "d" }) readonly d: string,
    ) {}
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
