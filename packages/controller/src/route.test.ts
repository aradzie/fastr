import { Context, Request, Response } from "@fastr/core";
import { Container } from "@fastr/invert";
import test from "ava";
import { controller } from "./decorator/controller.js";
import { http } from "./decorator/handler.js";
import { toRoutes } from "./route.js";

test("not a controller", (t) => {
  class Controller {}

  t.throws(() => {
    [...toRoutes(Controller)];
  });
});

test("empty controller", (t) => {
  @controller()
  class Controller {}

  t.deepEqual([...toRoutes(Controller)], []);
});

test("controller with handler methods", (t) => {
  @controller("/x")
  class Controller {
    @http.any({ name: "default" })
    handler1() {}
    @http.get("/b")
    handler2(arg: Container) {}
    @http.put("/c")
    handler3(arg: Context) {}
    @http.post("/d")
    handler4(arg: Request) {}
    @http.patch("/e")
    handler5(arg: Response) {}
  }

  const routes = [...toRoutes(Controller)];
  t.is(routes.length, 5);
  const [a, b, c, d, e] = routes;
  t.like(a, { name: "default", path: "/x", method: "*" });
  t.like(b, { name: null, path: "/x/b", method: "GET" });
  t.like(c, { name: null, path: "/x/c", method: "PUT" });
  t.like(d, { name: null, path: "/x/d", method: "POST" });
  t.like(e, { name: null, path: "/x/e", method: "PATCH" });
});
