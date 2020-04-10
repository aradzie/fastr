import {
  AbstractAdapter,
  AccessToken,
  ClientConfig,
  ResourceOwner,
  TokenResponse,
} from "@webfx-oauth/client";

export class FakeAdapter extends AbstractAdapter {
  tokenResponse: () => TokenResponse = () => ({
    /* eslint-disable @typescript-eslint/camelcase */
    token_type: "Bearer",
    access_token: "xyz",
    expires_in: 3600,
    /* eslint-enable @typescript-eslint/camelcase */
  });
  resourceOwner: () => ResourceOwner = () => ({
    raw: {},
    provider: "fake",
    id: "abc",
    email: null,
    name: null,
    imageUrl: null,
    url: null,
  });

  constructor(clientConfig: ClientConfig) {
    super(clientConfig, {
      authorizationUri: "https://localhost/authorizationUri",
      tokenUri: "https://localhost/tokenUri",
      profileUri: "https://localhost/profileUri",
    });
  }

  async getAccessToken(): Promise<AccessToken> {
    return new AccessToken({ ...this.tokenResponse() });
  }

  async getProfile(): Promise<ResourceOwner> {
    return { ...this.resourceOwner() };
  }

  protected parseProfileResponse(): ResourceOwner {
    throw new Error("Unreachable");
  }
}
