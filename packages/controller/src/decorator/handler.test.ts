import { Context, Request, Response } from "@fastr/core";
import { Container } from "@fastr/invert";
import test from "ava";
import { getHandlerMetadata } from "../impl/metadata.js";
import { controller } from "./controller.js";
import { http } from "./handler.js";

test("get handler metadata", (t) => {
  @controller()
  class Controller1 {
    @http.GET({ name: "index" })
    a() {}

    @http.POST("/post/:id")
    b() {}
  }

  t.deepEqual(getHandlerMetadata(Controller1.prototype, "a"), {
    method: "GET",
    path: "/",
    name: "index",
  });
  t.deepEqual(getHandlerMetadata(Controller1.prototype, "b"), {
    method: "POST",
    path: "/post/:id",
    name: null,
  });
});

test("validate metadata", (t) => {
  t.throws(
    () => {
      class Controller {
        @http.GET("")
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
        @http.GET("x")
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
        @http.GET("/x/")
        handler() {}
      }
    },
    {
      message: "Invalid path '/x/'",
    },
  );
  t.notThrows(() => {
    class Controller {
      @http.GET("/x")
      handler() {}
    }
  });
});

test("inject arguments", (t) => {
  t.notThrows(() => {
    @controller("/x")
    class Controller {
      @http.GET("/1")
      handler1() {}
      @http.GET("/2")
      handler2(arg: Container) {}
      @http.GET("/3")
      handler3(arg: Context) {}
      @http.GET("/4")
      handler4(arg: Request) {}
      @http.GET("/5")
      handler5(arg: Response) {}
    }
  });
});
