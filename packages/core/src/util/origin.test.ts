import test from "ava";
import { type IncomingHttpHeaders, type IncomingMessage } from "http";
import { getOrigin } from "./origin.js";

test("no proxy headers, http", (t) => {
  const req = {
    socket: {} as unknown, // Socket
    headers: {
      host: "some-host",
    } as IncomingHttpHeaders,
  } as IncomingMessage;

  t.is(getOrigin(req, true), "http://some-host");
});

test("no proxy headers, https", (t) => {
  const req = {
    socket: {
      encrypted: true,
    } as unknown, // TLSSocket
    headers: {
      host: "some-host",
    } as IncomingHttpHeaders,
  } as IncomingMessage;

  t.is(getOrigin(req, true), "https://some-host");
});

test("use `forwarded` proxy header, http", (t) => {
  const req = {
    socket: {},
    headers: {
      "host": "ignored-host",
      "forwarded": "host=forwarded-host; proto=http",
      "x-forwarded-host": "ignored-x-forwarded-host",
      "x-forwarded-proto": "http",
    } as IncomingHttpHeaders,
  } as IncomingMessage;

  t.is(getOrigin(req, true), "http://forwarded-host");
});

test("use `forwarded` proxy header, https", (t) => {
  const req = {
    socket: {},
    headers: {
      "host": "ignored-host",
      "forwarded": "host=forwarded-host; proto=https",
      "x-forwarded-host": "ignored-x-forwarded-host",
      "x-forwarded-proto": "http",
    } as IncomingHttpHeaders,
  } as IncomingMessage;

  t.is(getOrigin(req, true), "https://forwarded-host");
});

test("use `forwarded` proxy header, incomplete", (t) => {
  t.throws(
    () => {
      getOrigin(
        {
          socket: {},
          headers: {
            "host": "ignored-host",
            "forwarded": "host=forwarded-host",
            "x-forwarded-host": "x-forwarded-host",
            "x-forwarded-proto": "http",
          } as IncomingHttpHeaders,
        } as IncomingMessage,
        true,
      );
    },
    {
      message: "Incomplete 'forwarded' header.",
    },
  );
  t.throws(
    () => {
      getOrigin(
        {
          socket: {},
          headers: {
            "host": "ignored-host",
            "forwarded": "proto=forwarded-proto",
            "x-forwarded-host": "x-forwarded-host",
            "x-forwarded-proto": "http",
          } as IncomingHttpHeaders,
        } as IncomingMessage,
        true,
      );
    },
    {
      message: "Incomplete 'forwarded' header.",
    },
  );
});

test("use `x-forwarded-*` proxy headers, http", (t) => {
  const req = {
    socket: {},
    headers: {
      "host": "ignored-host",
      "x-forwarded-host": "x-forwarded-host",
      "x-forwarded-proto": "http",
    } as IncomingHttpHeaders,
  } as IncomingMessage;

  t.is(getOrigin(req, true), "http://x-forwarded-host");
});

test("use `x-forwarded-*` proxy headers, https", (t) => {
  const req = {
    socket: {},
    headers: {
      "host": "ignored-host",
      "x-forwarded-host": "x-forwarded-host",
      "x-forwarded-proto": "https",
    } as IncomingHttpHeaders,
  } as IncomingMessage;

  t.is(getOrigin(req, true), "https://x-forwarded-host");
});

test("use `x-forwarded-*` proxy headers, incomplete", (t) => {
  t.throws(
    () => {
      getOrigin(
        {
          socket: {},
          headers: {
            "host": "ignored-host",
            "x-forwarded-host": "x-forwarded-host",
          } as IncomingHttpHeaders,
        } as IncomingMessage,
        true,
      );
    },
    {
      message: "Incomplete 'x-forwarded' headers.",
    },
  );
  t.throws(
    () => {
      getOrigin(
        {
          socket: {},
          headers: {
            "host": "ignored-host",
            "x-forwarded-proto": "http",
          } as IncomingHttpHeaders,
        } as IncomingMessage,
        true,
      );
    },
    {
      message: "Incomplete 'x-forwarded' headers.",
    },
  );
});

test("ignore proxy headers", (t) => {
  const req = {
    socket: {},
    headers: {
      "host": "some-host",
      "forwarded": "host=ignored-forwarded-host; proto=http",
      "x-forwarded-host": "ignored-x-forwarded-host",
      "x-forwarded-proto": "http",
    } as IncomingHttpHeaders,
  } as IncomingMessage;

  t.is(getOrigin(req, false), "http://some-host");
});

test("empty headers", (t) => {
  t.throws(() => {
    getOrigin({ socket: {}, headers: {} } as IncomingMessage, false);
  });
  t.throws(() => {
    getOrigin({ socket: {}, headers: {} } as IncomingMessage, true);
  });
});
