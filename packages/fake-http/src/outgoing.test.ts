import test from "ava";
import { FakeOutgoingMessage } from "./outgoing.js";

test("write body", (t) => {
  const res = new FakeOutgoingMessage();

  res.end("body");

  t.is(res.getData("utf8"), "body");
});
