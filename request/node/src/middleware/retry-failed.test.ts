import test from "ava";
import {
  fakeNotFoundResponse,
  fakeOkResponse,
  fakeResponse,
} from "../fake/fakes";
import type { Adapter, HttpRequest, HttpResponse } from "../types";
import { retryFailed } from "./retry-failed";

test("pass through if response is successful", async (t) => {
  // Arrange.

  const underTest = retryFailed();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeOkResponse());

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
});

test("retry request if response is failing", async (t) => {
  // Arrange.

  const underTest = retryFailed();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeEventualOkResponse());

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
  t.is(response.status, 200);
  t.is(response.statusText, "OK");
  t.is(await response.body.text(), "done");
});

test("return failing response if too many retries", async (t) => {
  // Arrange.

  const underTest = retryFailed({ maxRetries: 1 });
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeEventualOkResponse());

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.false(response.ok);
  t.is(response.status, 500);
  t.is(response.statusText, "Internal Server Error");
  t.is(await response.body.text(), "b");
});

test("pass through error", async (t) => {
  // Arrange.

  const error = new Error("omg");
  const underTest = retryFailed();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, async () => {
      throw error;
    });

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/",
        method: "GET",
      });
    },
    {
      is: error,
    },
  );
});

export function fakeEventualOkResponse(): Adapter {
  let index = 0;
  return async (request: HttpRequest): Promise<HttpResponse> => {
    switch (index++) {
      case 0:
        return fakeResponse({ status: 500, bodyData: "a" })(request);
      case 1:
        return fakeResponse({ status: 500, bodyData: "b" })(request);
      case 2:
        return fakeResponse({ status: 502, bodyData: "c" })(request);
      case 3:
        return fakeOkResponse({ bodyData: "done" })(request);
      default:
        return fakeNotFoundResponse()(request);
    }
  };
}
