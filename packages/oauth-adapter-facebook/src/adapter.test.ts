import test from "ava";
import { FacebookAdapter } from "./adapter.js";

const adapter = new FacebookAdapter({
  clientId: "client_id",
  clientSecret: "client_secret",
  redirectUri: "redirect_uri",
  scope: "scope",
});

// eslint-disable-next-line ava/no-skip-test,ava/no-async-fn-without-await
test.skip("should load user profile", async (t) => {
  // const mock = new MockAdapter();
  //
  // mock.onAny().reply(200, {
  //   id: "id",
  //   name: "name",
  //   first_name: "first_name",
  //   last_name: "last_name",
  //   email: "email",
  //   picture: {
  //     data: {
  //       url: "imageUrl",
  //       is_silhouette: false,
  //     },
  //   },
  // } as FacebookProfileResponse);
  //
  // const accessToken = new AccessToken({
  //   access_token: "token",
  //   token_type: "bearer",
  //   expires_in: 3600,
  // });
  //
  // const profile = await adapter.getProfile(accessToken);
  //
  // t.deepEqual(profile, {
  //   provider: "facebook",
  //   id: "id",
  //   email: "email",
  //   name: "name",
  //   url: "https://www.facebook.com/id",
  //   imageUrl: "https://graph.facebook.com/id/picture",
  // });
});

// eslint-disable-next-line ava/no-skip-test,ava/no-async-fn-without-await
test.skip("should handle auth errors", async (t) => {
  // const mock = new MockAdapter();
  //
  // mock.onAny("http://server/").reply(400, {
  //   error: {
  //     message: "error description",
  //     type: "OAuthException",
  //     code: 100,
  //   },
  // } as FacebookErrorResponse);
  //
  // const err = await t.throwsAsync(async () => {
  //   await adapter.newClient().request({
  //     method: "get",
  //     url: "http://server/",
  //   });
  // });
  //
  // t.true(err instanceof OAuthError);
  // t.is(err.message, "OAuth error: error description");
});
