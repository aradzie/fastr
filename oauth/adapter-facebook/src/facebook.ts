import {
  AbstractProvider,
  Client,
  ClientConfig,
  ResourceOwner,
} from "@webfx-oauth/client";
import { FacebookClient } from "./client";
import type { FacebookProfileResponse } from "./types";

// See https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/
// See https://developers.facebook.com/docs/graph-api/using-graph-api/error-handling

export class FacebookProvider extends AbstractProvider {
  constructor(config: ClientConfig) {
    super(config, {
      authorizationUri: "https://www.facebook.com/v3.2/dialog/oauth",
      tokenUri: "https://graph.facebook.com/v3.2/oauth/access_token",
      profileUri:
        "https://graph.facebook.com/v3.2/me?fields=" +
        [
          "id",
          "name",
          "first_name",
          "last_name",
          "email",
          "picture.type(large){url,is_silhouette}",
          "link",
          "locale",
        ].join(","),
    });
  }

  newClient(): Client {
    return new FacebookClient({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });
  }

  protected parseProfileResponse({
    id,
    email,
    name,
    picture,
  }: FacebookProfileResponse): ResourceOwner {
    return {
      provider: "facebook",
      id: id,
      email: email ?? null,
      name: name,
      url: `https://www.facebook.com/${id}`,
      imageUrl: `https://graph.facebook.com/${id}/picture`,
    };
  }
}
