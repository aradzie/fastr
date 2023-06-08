import test from "ava";
import { request } from "../instance.js";
import { fakeAdapter } from "./adapter.js";

test.beforeEach(() => {
  fakeAdapter.reset();
});

test.afterEach(() => {
  fakeAdapter.reset();
});

test("fake adapter", async (t) => {
  // Arrange.

  fakeAdapter.on.GET("/url1").replyWith("GET /url1");
  fakeAdapter.on.GET("/url2").replyWith("GET /url2");
  fakeAdapter.on.POST("/url1").replyWith("POST /url1");
  fakeAdapter.on.POST("/url2").replyWith("POST /url2");

  {
    // Act.

    const response = await request.GET("/url1").send();

    // Assert.

    t.true(response.ok);
    t.is(response.status, 200);
    t.is(response.statusText, "OK");
    t.is(await response.text(), "GET /url1");
  }

  {
    // Act.

    const response = await request.GET("/url2").send();

    // Assert.

    t.true(response.ok);
    t.is(response.status, 200);
    t.is(response.statusText, "OK");
    t.is(await response.text(), "GET /url2");
  }

  {
    // Act.

    const response = await request.POST("/url1").send("something");

    // Assert.

    t.true(response.ok);
    t.is(response.status, 200);
    t.is(response.statusText, "OK");
    t.is(await response.text(), "POST /url1");
  }

  {
    // Act.

    const response = await request.POST("/url2").send("something");

    // Assert.

    t.true(response.ok);
    t.is(response.status, 200);
    t.is(response.statusText, "OK");
    t.is(await response.text(), "POST /url2");
  }
});
