import test from "ava";
import { controller } from "./controller.js";

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
