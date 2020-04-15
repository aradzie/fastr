import test from "ava";
import { fakeNotFoundResponse, fakeResponse } from "../fake/fakes";
import { HttpRequest, HttpResponse } from "../types";
import { handleErrors } from "./handle-errors";

test("passes through if response status is successful", async (t) => {
  // Arrange.

  const underTest = handleErrors();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeResponse());

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

test("throw error if response status is not successful", async (t) => {
  // Arrange.

  const underTest = handleErrors();
  const adapter = (req: HttpRequest): Promise<HttpResponse> =>
    underTest(req, fakeNotFoundResponse());

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/",
        method: "GET",
      });
    },
    {
      name: "HttpError [404]",
      message: "Not Found",
    },
  );
});

test("pass through error", async (t) => {
  // Arrange.

  const error = new Error("omg");
  const underTest = handleErrors();
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
