import test from "ava";
import MockDate from "mockdate";
import { AccessToken } from "./token";

const now = new Date("2001-02-03T04:05:06Z");

test.beforeEach(() => {
  MockDate.set(now);
});

test.afterEach(() => {
  MockDate.reset();
});

test("construct token from response", (t) => {
  const token = new AccessToken({
    access_token: "token",
    token_type: "bearer",
    expires_in: 3600,
  });

  t.deepEqual(
    { ...token },
    {
      token: "token",
      type: "bearer",
      expiresAt: new Date("2001-02-03T05:05:06Z"),
    },
  );
});
