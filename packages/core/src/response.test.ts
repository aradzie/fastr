import { FakeOutgoingMessage } from "@fastr/fake-http";
import test from "ava";
import { Response } from "./response.js";

test("null body changes status", (t) => {
  const response = new Response(new FakeOutgoingMessage() as any);

  t.false(response.hasStatus);
  t.false(response.hasBody);

  response.body = null;

  t.true(response.hasStatus);
  t.true(response.hasBody);

  t.is(response.status, 204);
  t.is(response.body, null);
});

test("non-null body changes status", (t) => {
  const response = new Response(new FakeOutgoingMessage() as any);

  t.false(response.hasStatus);
  t.false(response.hasBody);

  response.body = "hello";

  t.true(response.hasStatus);
  t.true(response.hasBody);

  t.is(response.status, 200);
  t.is(response.body, "hello");
});
