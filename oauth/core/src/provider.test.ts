import test from "ava";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { ResourceOwner } from "./profile";
import { AbstractProvider, ClientConfig, ProviderConfig } from "./provider";

class TestProvider extends AbstractProvider {
  constructor(clientConfig: ClientConfig, providerConfig: ProviderConfig) {
    super(clientConfig, providerConfig);
  }

  protected parseProfileResponse(): ResourceOwner {
    throw new Error();
  }
}

const authorizationUri = "http://authorization/";
const tokenUri = "http://token/";
const profileUri = "http://profile/";
const provider = new TestProvider(
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
    provider.getAuthorizationUrl({ state: "state" }),
    "http://authorization/" +
      "?response_type=code" +
      "&client_id=client_id" +
      "&scope=scope" +
      "&redirect_uri=redirect_uri" +
      "&state=state",
  );
});

test("should fetch access token", async (t) => {
  const mock = new MockAdapter(axios);

  mock.onAny(tokenUri).reply(200, {
    access_token: "random token",
    token_type: "bearer",
    expires_in: 3600,
  });

  const token = await provider.getAccessToken({ code: "code" });
  t.is(token.token, "random token");
  t.is(token.type, "bearer");

  mock.restore();
});
