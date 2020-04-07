import test from "ava";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Client } from "./client";
import { ClientError, OAuthError } from "./error";

const client = new Client({
  clientId: "clientId",
  clientSecret: "clientSecret",
});

test("should handle generic errors", async (t) => {
  const mock = new MockAdapter(axios);

  mock.onAny("http://server/").reply(404, "error response");

  try {
    await client.request({
      method: "get",
      url: "http://server/",
    });
    t.fail("Should throw error");
  } catch (err) {
    t.true(err instanceof ClientError);
    t.is(err.message, "Request failed with status code 404");
  }

  mock.restore();
});

test("should handle auth errors", async (t) => {
  const mock = new MockAdapter(axios);

  mock.onAny("http://server/").reply(400, {
    error: "invalid_request",
    error_description: "error description",
  });

  try {
    await client.request({
      method: "get",
      url: "http://server/",
    });
    t.fail("Should throw error");
  } catch (err) {
    t.true(err instanceof OAuthError);
    t.is(err.message, "OAuth error: error description");
  }

  mock.restore();
});
