import test from "ava";
import { fakeNotFoundResponse, fakeOkResponse } from "../fakes";
import { handleErrors } from "./handle-errors";

test("passes through if response status is successful", async (t) => {
  // Arrange.

  const underTest = handleErrors();
  const adapter = underTest(fakeOkResponse());

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
  const adapter = underTest(fakeNotFoundResponse());

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/",
        method: "GET",
      });
    },
    {
      name: "NotFoundError",
      message: "Not Found",
    },
  );
});
