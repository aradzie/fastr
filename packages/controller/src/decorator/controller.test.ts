import test from "ava";
import { getControllerMetadata } from "../impl/metadata.js";
import { controller } from "./controller.js";

test("get controller metadata", (t) => {
  @controller("/prefix")
  class Controller1 {}

  t.deepEqual(getControllerMetadata(Controller1), {
    path: "/prefix",
  });
});

test("validate metadata", (t) => {
  t.throws(
    () => {
      @controller("")
      class Controller {}
    },
    {
      message: "Invalid path ''",
    },
  );
  t.throws(
    () => {
      @controller("x")
      class Controller {}
    },
    {
      message: "Invalid path 'x'",
    },
  );
  t.throws(
    () => {
      @controller("/x/")
      class Controller {}
    },
    {
      message: "Invalid path '/x/'",
    },
  );
  t.notThrows(() => {
    @controller("/x")
    class Controller {}
  });
});
