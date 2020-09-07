import {
  AbstractAdapter,
  ClientConfig,
  ResourceOwner,
} from "@webfx-oauth/client";
import type { GoogleProfileResponse } from "./types.js";

// See https://developers.google.com/identity/protocols/OpenIDConnect
// See https://accounts.google.com/.well-known/openid-configuration

export class GoogleAdapter extends AbstractAdapter {
  constructor(config: ClientConfig) {
    super(config, {
      authorizationUri: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
      profileUri: "https://openidconnect.googleapis.com/v1/userinfo",
    });
  }

  protected parseProfileResponse(
    response: GoogleProfileResponse,
  ): ResourceOwner<GoogleProfileResponse> {
    const { sub, name, picture, email } = response;
    return {
      raw: response,
      provider: "google",
      id: sub,
      name: name ?? null,
      url: null,
      imageUrl: picture ?? null,
      email: email ?? null,
    };
  }
}
