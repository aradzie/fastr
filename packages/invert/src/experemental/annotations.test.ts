import { reflectorOf } from "@fastr/lang";
import test from "ava";
import { named, tagged } from "./annotations.js";
import { getParameterTags, getPropertyTags } from "./impl.js";
import { kNameTag } from "./tags.js";

test("annotate with tags", (t) => {
  class Example {
    @named("name1") x!: string;
    @tagged("tag1", "value1") y!: string;

    constructor(
      @named("name2") a: string, //
      @tagged("tag2", "value2") b: string,
    ) {}

    demo(
      @named("name3") a: string, //
      @tagged("tag3", "value3") b: string,
    ) {}
  }

  t.deepEqual(getPropertyTags(Example.prototype, "x"), { [kNameTag]: "name1" });
  t.deepEqual(getPropertyTags(Example.prototype, "y"), { ["tag1"]: "value1" });
  t.deepEqual(getParameterTags(Example, undefined), [
    { [kNameTag]: "name2" },
    { ["tag2"]: "value2" },
  ]);
  t.deepEqual(getParameterTags(Example.prototype, "demo"), [
    { [kNameTag]: "name3" },
    { ["tag3"]: "value3" },
  ]);

  const ref = reflectorOf(Example);
  t.deepEqual(Object.keys(ref.properties), ["x", "y"]);
});
