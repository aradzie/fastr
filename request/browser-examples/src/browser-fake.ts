import { FakeHttpResponse, fakeRequest } from "@webfx/browser-request-fake";

fakeRequest("GET", "http://localhost/", FakeHttpResponse.empty());
fakeRequest("POST", "http://localhost/", FakeHttpResponse.empty());
fakeRequest("GET", /prefix\/*./, FakeHttpResponse.empty());
fakeRequest("POST", /prefix\/*./, FakeHttpResponse.empty());

fakeRequest(
  "GET",
  "http://localhost/",
  FakeHttpResponse.json(
    { payload: "value" },
    {
      status: 200,
      statusText: "OK",
      headers: { "X-Foo": "bar" },
    },
  ),
);
