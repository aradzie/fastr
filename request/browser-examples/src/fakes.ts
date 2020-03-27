import { request } from "@webfx/browser-request";
import { FakeHttpResponse, fakeRequest } from "@webfx/browser-request-fake";

// Install fake responses.

fakeRequest("GET", "http://localhost/expect-get", FakeHttpResponse.empty());
fakeRequest("POST", "http://localhost/expect-post", FakeHttpResponse.empty());
fakeRequest("GET", /expect-get\/*./, FakeHttpResponse.empty());
fakeRequest("POST", /expect-post\/*./, FakeHttpResponse.empty());
fakeRequest(
  "GET",
  "http://localhost/get-text",
  FakeHttpResponse.text("text response", {
    status: 200,
    statusText: "OK",
    headers: { "X-Foo": "bar" },
  }),
);
fakeRequest(
  "GET",
  "http://localhost/get-json",
  FakeHttpResponse.json(
    { type: "json response" },
    {
      status: 200,
      statusText: "OK",
      headers: { "X-Foo": "bar" },
    },
  ),
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
