import {
  AbstractProvider,
  ClientConfig,
  ResourceOwner,
} from "@webfx-oauth/client";
import type { GoogleProfileResponse } from "./types";

// See https://developers.google.com/identity/protocols/OpenIDConnect
// See https://accounts.google.com/.well-known/openid-configuration

export class GoogleProvider extends AbstractProvider {
  constructor(config: ClientConfig) {
    super(config, {
      authorizationUri: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
      profileUri: "https://openidconnect.googleapis.com/v1/userinfo",
    });
  }

  protected parseProfileResponse({
    sub,
    name,
    picture,
    email,
  }: GoogleProfileResponse): ResourceOwner {
    return {
      provider: "google",
      id: sub,
      email: email ?? null,
      name: name ?? null,
      url: null,
      imageUrl: picture ?? null,
    };
  }
}
