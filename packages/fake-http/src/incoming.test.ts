import test from "ava";
import { FakeIncomingMessage } from "./incoming.js";

test("read body", async (t) => {
  const req = new FakeIncomingMessage("body");

  let body = "";
  for await (const part of req) {
    body += part.toString("utf8");
  }

  t.is(body, "body");
});
