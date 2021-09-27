import test from "ava";
import { controller } from "./controller.js";

test("should validate metadata", (t) => {
  t.throws(() => {
    @controller("")
    class Controller {}
  });
  t.throws(() => {
    @controller("x")
    class Controller {}
  });
  t.throws(() => {
    @controller("/x/")
    class Controller {}
  });

  @controller("/x")
  class Controller {}
});
