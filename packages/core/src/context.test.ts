import {
  FakeIncomingMessage,
  FakeOutgoingMessage,
  FakeSocket,
} from "@fastr/fake-http";
import { Container } from "@fastr/invert";
import test from "ava";
import { Context } from "./context.js";
import { Request } from "./request.js";
import { Response } from "./response.js";

test("insecure cookies", (t) => {
  // Arrange.

  const req = new FakeIncomingMessage(null, { headers: { cookie: "a=1" } });
  const res = new FakeOutgoingMessage();

  req.socket = new FakeSocket({ encrypted: false });

  const context = new Context(
    new Container(),
    new Request(req as any, { behindProxy: false }),
    new Response(res as any),
    { params: {} },
  );

  // Act.

  context.cookies.set("b", "2", { path: "/path" });

  // Assert.

  t.is(context.cookies.get("a"), "1");
  t.is(context.cookies.get("b"), null);
  t.is(res.getHeader("set-cookie"), "b=2; Path=/path");
});

test("secure cookies", (t) => {
  // Arrange.

  const req = new FakeIncomingMessage(null, { headers: { cookie: "a=1" } });
  const res = new FakeOutgoingMessage();

  req.socket = new FakeSocket({ encrypted: true });

  const context = new Context(
    new Container(),
    new Request(req as any, { behindProxy: false }),
    new Response(res as any),
    { params: {} },
  );

  // Act.

  context.cookies.set("b", "2", { path: "/path" });

  // Assert.

  t.is(context.cookies.get("a"), "1");
  t.is(context.cookies.get("b"), null);
  t.is(res.getHeader("set-cookie"), "b=2; Path=/path; Secure");
});
