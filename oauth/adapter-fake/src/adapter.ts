import {
  AbstractAdapter,
  AccessToken,
  ResourceOwner,
} from "@webfx-oauth/client";

// TODO Error responses.

export class FakeAdapter extends AbstractAdapter {
  owner: ResourceOwner = {
    raw: {},
    provider: "fake",
    id: "123",
    email: "fake@keybr.com",
    name: "fake",
    url: "url",
    imageUrl: "imageUrl",
  };

  constructor(redirectUri: string) {
    super(
      {
        clientId: "fake",
        clientSecret: "secret",
        scope: "email",
        redirectUri,
      },
      {
        authorizationUri: "https://localhost/authorizationUri",
        tokenUri: "https://localhost/tokenUri",
        profileUri: "https://localhost/profileUri",
      },
    );
  }

  async getAccessToken(): Promise<AccessToken> {
    return new AccessToken({
      access_token: "123",
      token_type: "bearer",
      expires_in: 3600,
    });
  }

  async getProfile(): Promise<ResourceOwner> {
    return { ...this.owner };
  }

  protected parseProfileResponse(): ResourceOwner {
    throw new Error("Unreachable");
  }
}
