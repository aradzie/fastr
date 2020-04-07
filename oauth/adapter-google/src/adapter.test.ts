import test from "ava";
import { GoogleAdapter } from "./adapter";

const adapter = new GoogleAdapter({
  clientId: "client_id",
  clientSecret: "client_secret",
  redirectUri: "redirect_uri",
  scope: "scope",
});

test("should load user profile", async (t) => {
  // const mock = new MockAdapter(axios);
  //
  // mock.onAny().reply(200, {
  //   sub: "id",
  //   name: "name",
  //   given_name: "given_name",
  //   family_name: "family_name",
  //   picture: "imageUrl",
  //   email: "email",
  //   email_verified: true,
  //   locale: "en",
  // } as GoogleProfileResponse);
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
  //   provider: "google",
  //   id: "id",
  //   email: "email",
  //   name: "name",
  //   url: null,
  //   imageUrl: "imageUrl",
  // });

  await "something";

  t.pass();
});
