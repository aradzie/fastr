import test from "ava";
import { injectable } from "../annotations.js";
import { Container } from "../container.js";
import { ContainerError } from "../errors.js";

test("get from an empty container", (t) => {
  @injectable()
  class Demo {}

  const container = new Container({ autoBindInjectable: false });

  t.false(container.has("id"));
  t.throws(
    () => {
      container.get("id");
    },
    {
      instanceOf: ContainerError,
    },
  );
  t.false(container.has("id", "name"));
  t.throws(
    () => {
      container.get("id", "name");
    },
    {
      instanceOf: ContainerError,
    },
  );
  t.false(container.has(Demo));
  t.throws(
    () => {
      container.get(Demo);
    },
    {
      instanceOf: ContainerError,
    },
  );
  t.false(container.has(Demo, "name"));
  t.throws(
    () => {
      container.get(Demo, "name");
    },
    {
      instanceOf: ContainerError,
    },
  );
});
