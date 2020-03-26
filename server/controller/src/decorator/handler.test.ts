import test from "ava";
import { http } from "./handler";

test("should validate metadata", (t) => {
  t.throws(() => {
    class Controller {
      @http.get("")
      handler() {}
    }
  });
  t.throws(() => {
    class Controller {
      @http.get("x")
      handler() {}
    }
  });
  t.throws(() => {
    class Controller {
      @http.get("/x/")
      handler() {}
    }
  });

  class Controller {
    @http.get("/x")
    handler() {}
  }
});
