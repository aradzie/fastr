import { request } from "@webfx/browser-request";
import { fakeAdapter, FakeHttpResponse } from "@webfx/browser-request-fake";

// Install fake responses.

fakeAdapter.addResponse(
  "GET",
  "http://localhost/get-text",
  FakeHttpResponse.body("text response", {
    headers: { "Content-Type": "text/plain" },
  }),
);
fakeAdapter.addResponse(
  "GET",
  "http://localhost/get-json",
  FakeHttpResponse.jsonBody({ type: "json response" }),
);

// Make requests.

request
  .get("http://localhost/get-text")
  .send()
  .then((response) => {
    console.log(response);
  })
  .catch((err) => {
    console.error(err);
  });
request
  .get("http://localhost/get-json")
  .send()
  .then((response) => {
    console.log(response);
  })
  .catch((err) => {
    console.error(err);
  });
