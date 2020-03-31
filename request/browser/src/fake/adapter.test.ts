import test from "ava";
import { request } from "../request";
import { fakeAdapter } from "./adapter";
import { FakeHttpResponse } from "./response";

test.beforeEach(() => {
  fakeAdapter.reset();
});

test.afterEach(() => {
  fakeAdapter.reset();
});

test("fake adapter", async (t) => {
  // Arrange.

  fakeAdapter.on.get("/url1").reply(FakeHttpResponse.withBody("GET /url1"));
  fakeAdapter.on.get("/url2").reply(FakeHttpResponse.withBody("GET /url2"));
  fakeAdapter.on.post("/url1").reply(FakeHttpResponse.withBody("POST /url1"));
  fakeAdapter.on.post("/url2").reply(FakeHttpResponse.withBody("POST /url2"));

  {
    // Act.

    const response = await request.get("/url1").send();

    // Assert.

    t.true(response.ok);
    t.is(response.status, 200);
    t.is(response.statusText, "OK");
    t.is(await response.text(), "GET /url1");
  }

  {
    // Act.

    const response = await request.get("/url2").send();

    // Assert.

    t.true(response.ok);
    t.is(response.status, 200);
    t.is(response.statusText, "OK");
    t.is(await response.text(), "GET /url2");
  }

  {
    // Act.

    const response = await request.post("/url1").sendBody("something");

    // Assert.

    t.true(response.ok);
    t.is(response.status, 200);
    t.is(response.statusText, "OK");
    t.is(await response.text(), "POST /url1");
  }

  {
    // Act.

    const response = await request.post("/url2").sendBody("something");

    // Assert.

    t.true(response.ok);
    t.is(response.status, 200);
    t.is(response.statusText, "OK");
    t.is(await response.text(), "POST /url2");
  }
});
