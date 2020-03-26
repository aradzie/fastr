import test from "ava";
import { http } from "./handler.js";

test("validate metadata", (t) => {
  t.throws(
    () => {
      class Controller {
        @http.get("")
        handler() {}
      }
    },
    {
      message: "Invalid path ''",
    },
  );
  t.throws(
    () => {
      class Controller {
        @http.get("x")
        handler() {}
      }
    },
    {
      message: "Invalid path 'x'",
    },
  );
  t.throws(
    () => {
      class Controller {
        @http.get("/x/")
        handler() {}
      }
    },
    {
      message: "Invalid path '/x/'",
    },
  );
  t.notThrows(() => {
    class Controller {
      @http.get("/x")
      handler() {}
    }
  });
});
