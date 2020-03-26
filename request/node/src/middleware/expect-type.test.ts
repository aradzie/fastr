import test from "ava";
import { fakeOkResponse } from "../fakes";
import { expectType } from "./expect-type";

test("return response if content type matches", async (t) => {
  // Arrange.

  const underTest = expectType("text/plain");
  const adapter = underTest(
    fakeOkResponse({
      headers: { "content-type": "text/plain" },
      bodyData: "text",
    }),
  );

  // Act.

  const response = await adapter({
    url: "http://test/",
    method: "GET",
  });

  // Assert.

  t.true(response.ok);
});

test("throw error if content type does not match", async (t) => {
  // Arrange.

  const underTest = expectType("text/plain");
  const adapter = underTest(
    fakeOkResponse({
      headers: { "content-type": "application/json" },
      bodyData: "{}",
    }),
  );

  // Assert.

  await t.throwsAsync(
    async () => {
      await adapter({
        url: "http://test/",
        method: "GET",
      });
    },
    {
      name: "UnsupportedMediaTypeError",
      message: "Unsupported Media Type",
    },
  );
});
