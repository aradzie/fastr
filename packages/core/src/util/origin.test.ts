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
          host: `host:123`,
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "http://host:123",
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
          host: `host:123`,
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "https://host:123",
  );
});

test("no proxy headers, :authority, http", (t) => {
  t.is(
    getOrigin(
      {
        socket: {} as unknown, // Socket
        headers: {
          ":authority": `host:123`,
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "http://host:123",
  );
});

test("no proxy headers, :authority, https", (t) => {
  t.is(
    getOrigin(
      {
        socket: {
          encrypted: true,
        } as unknown, // TLSSocket
        headers: {
          ":authority": `host:123`,
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "https://host:123",
  );
});

test("use `x-forwarded-*` proxy headers, http", (t) => {
  t.is(
    getOrigin(
      {
        socket: {},
        headers: {
          "host": `ignored`,
          "x-forwarded-host": `host:123`,
          "x-forwarded-proto": `http`,
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "http://host:123",
  );
});

test("use `x-forwarded-*` proxy headers, https", (t) => {
  t.is(
    getOrigin(
      {
        socket: {},
        headers: {
          "host": `ignored`,
          "x-forwarded-host": `host:123`,
          "x-forwarded-proto": `https`,
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      true,
    ),
    "https://host:123",
  );
});

test("use `x-forwarded-*` proxy headers, incomplete", (t) => {
  t.throws(
    () => {
      getOrigin(
        {
          socket: {},
          headers: {
            "host": `ignored`,
            "x-forwarded-host": `host:123`,
          } as IncomingHttpHeaders,
        } as IncomingMessage,
        true,
      );
    },
    {
      instanceOf: BadRequestError,
    },
  );
  t.throws(
    () => {
      getOrigin(
        {
          socket: {},
          headers: {
            "host": `ignored`,
            "x-forwarded-proto": `http`,
          } as IncomingHttpHeaders,
        } as IncomingMessage,
        true,
      );
    },
    {
      instanceOf: BadRequestError,
    },
  );
});

test("ignore proxy headers", (t) => {
  t.is(
    getOrigin(
      {
        socket: {},
        headers: {
          "host": `host:123`,
          "forwarded": `host=ignored; proto=ignored`,
          "x-forwarded-host": `ignored`,
          "x-forwarded-proto": `ignored`,
        } as IncomingHttpHeaders,
      } as IncomingMessage,
      false,
    ),
    "http://host:123",
  );
});

test("empty headers", (t) => {
  t.throws(
    () => {
      getOrigin({ socket: {}, headers: {} } as IncomingMessage, false);
    },
    {
      instanceOf: BadRequestError,
    },
  );
  t.throws(
    () => {
      getOrigin({ socket: {}, headers: {} } as IncomingMessage, true);
    },
    {
      instanceOf: BadRequestError,
    },
  );
});
