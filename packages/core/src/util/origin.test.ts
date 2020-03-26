import { BadRequestError } from "@fastr/errors";
import test from "ava";
import { type IncomingHttpHeaders, type IncomingMessage } from "http";
import { getOrigin } from "./origin.js";

test("no proxy headers, http", (t) => {
  t.is(
    getOrigin(
      {
        socket: {} as unknown, // Socket
        headers: {
          host: "some-host",
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "http://some-host",
  );
});

test("no proxy headers, https", (t) => {
  t.is(
    getOrigin(
      {
        socket: {
          encrypted: true,
        } as unknown, // TLSSocket
        headers: {
          host: "some-host",
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "https://some-host",
  );
});

test("use `forwarded` proxy header, http", (t) => {
  t.is(
    getOrigin(
      {
        socket: {},
        headers: {
          "host": "ignored-host",
          "forwarded": "host=forwarded-host; proto=http",
          "x-forwarded-host": "ignored-x-forwarded-host",
          "x-forwarded-proto": "http",
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "http://forwarded-host",
  );
});

test("use `forwarded` proxy header, https", (t) => {
  t.is(
    getOrigin(
      {
        socket: {},
        headers: {
          "host": "ignored-host",
          "forwarded": "host=forwarded-host; proto=https",
          "x-forwarded-host": "ignored-x-forwarded-host",
          "x-forwarded-proto": "http",
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "https://forwarded-host",
  );
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
      instanceOf: BadRequestError,
      message: "Invalid Headers",
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
      instanceOf: BadRequestError,
      message: "Invalid Headers",
    },
  );
});

test("use `x-forwarded-*` proxy headers, http", (t) => {
  t.is(
    getOrigin(
      {
        socket: {},
        headers: {
          "host": "ignored-host",
          "x-forwarded-host": "x-forwarded-host",
          "x-forwarded-proto": "http",
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "http://x-forwarded-host",
  );
});

test("use `x-forwarded-*` proxy headers, https", (t) => {
  t.is(
    getOrigin(
      {
        socket: {},
        headers: {
          "host": "ignored-host",
          "x-forwarded-host": "x-forwarded-host",
          "x-forwarded-proto": "https",
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "https://x-forwarded-host",
  );
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
      instanceOf: BadRequestError,
      message: "Invalid Headers",
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
      instanceOf: BadRequestError,
      message: "Invalid Headers",
    },
  );
});

test("ignore proxy headers", (t) => {
  t.is(
    getOrigin(
      {
        socket: {},
        headers: {
          "host": "some-host",
          "forwarded": "host=ignored-forwarded-host; proto=http",
          "x-forwarded-host": "ignored-x-forwarded-host",
          "x-forwarded-proto": "http",
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      false,
    ),
    "http://some-host",
  );
});

test("empty headers", (t) => {
  t.throws(
    () => {
      getOrigin({ socket: {}, headers: {} } as IncomingMessage, false);
    },
    {
      instanceOf: BadRequestError,
      message: "Invalid Headers",
    },
  );
  t.throws(
    () => {
      getOrigin({ socket: {}, headers: {} } as IncomingMessage, true);
    },
    {
      instanceOf: BadRequestError,
      message: "Invalid Headers",
    },
  );
});
