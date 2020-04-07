import test from "ava";
import { AbstractAdapter } from "./adapter";
import type { ResourceOwner } from "./profile";
import type { AdapterConfig, ClientConfig } from "./types";

class TestAdapter extends AbstractAdapter {
  constructor(clientConfig: ClientConfig, adapterConfig: AdapterConfig) {
    super(clientConfig, adapterConfig);
  }

  protected parseProfileResponse(): ResourceOwner {
    throw new Error();
  }
}

const authorizationUri = "http://authorization/";
const tokenUri = "http://token/";
const profileUri = "http://profile/";
const adapter = new TestAdapter(
  {
    clientId: "client_id",
    clientSecret: "client_secret",
    redirectUri: "redirect_uri",
    scope: "scope",
  },
  {
    authorizationUri,
    tokenUri,
    profileUri,
  },
);

test("should generate authorization url", (t) => {
  t.is(
    adapter.getAuthorizationUrl({ state: "state" }),
    "http://authorization/" +
      "?response_type=code" +
      "&client_id=client_id" +
      "&scope=scope" +
      "&redirect_uri=redirect_uri" +
      "&state=state",
  );
});

test("should fetch access token", async (t) => {
  // const mock = new MockAdapter(axios);
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
