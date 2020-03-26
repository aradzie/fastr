import test from "ava";
import { FakeResponse } from "../fakes/index.js";
import { type Adapter, type HttpRequest, type HttpResponse } from "../types.js";
import { retryFailed } from "./retry-failed.js";

test("pass through if response is successful", async (t) => {
  // Arrange.

  const underTest = retryFailed();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, FakeResponse.of("ok"));

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
    adapter({
      url: "http://test/",
      method: "GET",
    }),
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
        return FakeResponse.of("a", { status: 500 })(request);
      case 1:
        return FakeResponse.of("b", { status: 500 })(request);
      case 2:
        return FakeResponse.of("c", { status: 502 })(request);
      case 3:
        return FakeResponse.of("done")(request);
      default:
        return FakeResponse.notFound()(request);
    }
  };
}
