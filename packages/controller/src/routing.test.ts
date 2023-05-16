import { Context, Request, Response } from "@fastr/core";
import { Container } from "@fastr/invert";
import { Router } from "@fastr/middleware-router";
import test from "ava";
import { controller } from "./decorator/controller.js";
import { http } from "./decorator/handler.js";
import { addController } from "./routing.js";

test("routing", (t) => {
  @controller("/x")
  class Controller {
    @http.get("/1")
    handler1() {
      return "1";
    }
    @http.get("/2")
    handler2(arg: Container) {
      return "2";
    }
    @http.get("/3")
    handler3(arg: Context) {
      return "3";
    }
    @http.get("/4")
    handler4(arg: Request) {
      return "4";
    }
    @http.get("/5")
    handler5(arg: Response) {
      return "5";
    }
  }

  const router = new Router();

  addController(router, Controller);

  router.middleware();

  t.pass();

  // TODO Write tests. Use fake request/respons?
});
