import test from "ava";
import { reflect } from "../fake/response.js";
import { type HttpRequest, type HttpResponse } from "../types.js";
import { defaultOptions } from "./default-options.js";

test("set default values", async (t) => {
  // Arrange.

  const underTest = defaultOptions({ timeout: 123 });
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, reflect());

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
  t.deepEqual(await response.body.json(), {
    method: "GET",
    url: "http://test/",
    headers: {},
    body: null,
    options: { timeout: 123 },
    calls: 1,
  });
});

test("use explicit values", async (t) => {
  // Arrange.

  const underTest = defaultOptions({ timeout: 123 });
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, reflect());

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
    options: {
      timeout: 321,
    },
  });

  // Assert.

  t.true(response.ok);
  t.deepEqual(await response.body.json(), {
    method: "GET",
    url: "http://test/",
    headers: {},
    body: null,
    options: { timeout: 321 },
    calls: 1,
  });
});
