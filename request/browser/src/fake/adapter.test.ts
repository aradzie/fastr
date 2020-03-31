import test from "ava";
import { request } from "../request";
import { fakeAdapter } from "./adapter";
import { FakeHttpResponse } from "./response";

test("fake adapter", async (t) => {
  fakeAdapter.addResponse(
    "GET",
    "/resource-url",
    FakeHttpResponse.body("text response", {
      headers: { "Content-Type": "text/plain" },
    }),
  );

  const response = await request.get("/resource-url").send();

  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(await response.text(), "text response");
});
