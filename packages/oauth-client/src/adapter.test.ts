import test from "ava";
import { AbstractAdapter } from "./adapter.js";
import type { ResourceOwner } from "./resource-owner.js";
import type { ClientConfig } from "./types.js";

class TestAdapter extends AbstractAdapter {
  constructor(clientConfig: ClientConfig) {
    super(clientConfig, {
      authorizationUri: "https://test/authorization/",
      tokenUri: "https://test/token/",
      profileUri: "https://test/profile/",
    });
  }

  protected parseProfileResponse(): ResourceOwner {
    throw new Error();
  }
}

const adapter = new TestAdapter({
  clientId: "client_id1",
  clientSecret: "client_secret1",
  redirectUri: "redirect_uri1",
  scope: "scope1",
});

test("should generate authorization url", (t) => {
  t.is(
    adapter.getAuthorizationUrl({ state: "state1" }),
    "https://test/authorization/" +
      "?response_type=code" +
      "&client_id=client_id1" +
      "&scope=scope1" +
      "&redirect_uri=redirect_uri1" +
      "&state=state1",
  );
});

test.skip("should fetch access token", async (t) => {
  // const mock = new MockAdapter();
  //
  // mock.onAny(tokenUri).reply(200, {
  //   access_token: "random token",
  //   token_type: "bearer",
  //   expires_in: 3600,
  // });

  const token = await adapter.getAccessToken({ code: "code" });
  t.is(token.token, "random token");
  t.is(token.type, "bearer");
});
