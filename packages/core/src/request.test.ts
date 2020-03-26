import test from "ava";
import { type IncomingMessage } from "http";
import { Request } from "./request.js";

test("empty body", (t) => {
  const request = new Request(
    {
      socket: {},
      headers: { host: "host" },
    } as IncomingMessage,
    { behindProxy: false },
  );

  t.false(request.hasBody);
  t.is(request.contentType, null);
  t.is(request.contentLength, null);
  t.is(request.is("text/plain"), null);
  t.is(request.is("*/*"), null);
});

test("unknown body type and length", (t) => {
  const request = new Request(
    {
      socket: {},
      headers: {
        "host": "host",
        "transfer-encoding": "chunked",
      },
    } as IncomingMessage,
    { behindProxy: false },
  );

  t.true(request.hasBody);
  t.is(request.contentType, null);
  t.is(request.contentLength, null);
  t.is(request.is("text/plain"), false);
  t.is(request.is("*/*"), false);
});

test("known body type and length", (t) => {
  const request = new Request(
    {
      socket: {},
      headers: {
        "host": "host",
        "content-type": "text/plain; charset=UTF-8",
        "content-length": "100",
      },
    } as IncomingMessage,
    { behindProxy: false },
  );

  t.true(request.hasBody);
  t.is(request.contentType, "text/plain; charset=UTF-8");
  t.is(request.contentLength, 100);
  t.is(request.is("text/plain"), "text/plain");
  t.is(request.is("text/*"), "text/plain");
  t.is(request.is("*/*"), "text/plain");
  t.is(request.is("text/html"), false);
  t.is(request.is("application/json"), false);
  t.is(request.is("text/html", "application/json"), false);
  t.is(request.is("text/html", "application/json", "text/plain"), "text/plain");
  t.is(request.is("text/html", "application/json", "*/*"), "text/plain");
});
