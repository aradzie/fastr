import { AccessToken, axios, OAuthError } from "@webfx-oauth/core";
import test from "ava";
import MockAdapter from "axios-mock-adapter";
import { FacebookProvider } from "./facebook";
import type { FacebookErrorResponse, FacebookProfileResponse } from "./types";

/* eslint-disable @typescript-eslint/camelcase */

const provider = new FacebookProvider({
  clientId: "client_id",
  clientSecret: "client_secret",
  redirectUri: "redirect_uri",
  scope: "scope",
});

test("should load user profile", async (t) => {
  const mock = new MockAdapter(axios);

  mock.onAny().reply(200, {
    id: "id",
    name: "name",
    first_name: "first_name",
    last_name: "last_name",
    email: "email",
    picture: {
      data: {
        url: "imageUrl",
        is_silhouette: false,
      },
    },
  } as FacebookProfileResponse);

  const accessToken = new AccessToken({
    access_token: "token",
    token_type: "bearer",
    expires_in: 3600,
  });

  const profile = await provider.getProfile(accessToken);

  t.deepEqual(profile, {
    provider: "facebook",
    id: "id",
    email: "email",
    name: "name",
    url: "https://www.facebook.com/id",
    imageUrl: "https://graph.facebook.com/id/picture",
  });

  mock.restore();
});

test("should handle auth errors", async (t) => {
  const mock = new MockAdapter(axios);

  mock.onAny("http://server/").reply(400, {
    error: {
      message: "error description",
      type: "OAuthException",
      code: 100,
    },
  } as FacebookErrorResponse);

  const err = await t.throwsAsync(async () => {
    await provider.newClient().request({
      method: "get",
      url: "http://server/",
    });
  });

  t.true(err instanceof OAuthError);
  t.is(err.message, "OAuth error: error description");

  mock.restore();
});
