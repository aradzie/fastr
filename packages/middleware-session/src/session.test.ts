import {
  Cookies,
  IncomingMessageHeaders,
  OutgoingMessageHeaders,
} from "@fastr/core";
import test from "ava";
import { IncomingMessage, OutgoingMessage } from "http";
import { type Socket } from "net";
import { Adapter } from "./adapter.js";
import { type ParsedOptions, parseOptions } from "./options.js";
import { Session } from "./session.js";

test("set value", (t) => {
  const session = new Session(new FakeAdapter());

  t.false(session.has("key"));
  t.is(session.get("key"), null);
  t.is(session.get("key", "x"), "x");
  t.deepEqual(Object.fromEntries(session.entries()), {});
  t.deepEqual(session.toJSON(), {});

  session.set("key", "value");

  t.true(session.has("key"));
  t.is(session.get("key"), "value");
  t.is(session.get("key", "x"), "value");
  t.deepEqual(Object.fromEntries(session.entries()), { key: "value" });
  t.deepEqual(session.toJSON(), { key: "value" });
});

test("set many values", (t) => {
  const session = new Session(new FakeAdapter());

  t.false(session.has("key"));
  t.is(session.get("key"), null);
  t.is(session.get("key", "x"), "x");
  t.deepEqual(Object.fromEntries(session.entries()), {});
  t.deepEqual(session.toJSON(), {});

  session.set({ key: "value", a: 1, b: 2 });

  t.true(session.has("key"));
  t.is(session.get("key"), "value");
  t.is(session.get("key", "x"), "value");
  t.deepEqual(Object.fromEntries(session.entries()), {
    key: "value",
    a: 1,
    b: 2,
  });
  t.deepEqual(session.toJSON(), { key: "value", a: 1, b: 2 });
});

test("pull values", (t) => {
  const session = new Session(new FakeAdapter());

  t.is(session.pull("key", "x"), "x");

  session.set({ key: "value" });

  t.true(session.has("key"));
  t.is(session.pull("key", "x"), "value");
  t.false(session.has("key"));
  t.is(session.pull("key", "x"), "x");
});

test("delete values", (t) => {
  const session = new Session(new FakeAdapter());

  session.set({ key: "value", a: 1, b: 2 });

  t.true(session.has("key"));
  t.true(session.has("a"));
  t.true(session.has("b"));
  t.deepEqual(session.toJSON(), { key: "value", a: 1, b: 2 });

  session.delete("key");

  t.false(session.has("key"));
  t.true(session.has("a"));
  t.true(session.has("b"));
  t.deepEqual(session.toJSON(), { a: 1, b: 2 });

  session.clear();

  t.false(session.has("key"));
  t.false(session.has("a"));
  t.false(session.has("b"));
  t.deepEqual(session.toJSON(), {});
});

class FakeAdapter extends Adapter {
  static fakeCookies(): Cookies {
    const req = new IncomingMessage({} as Socket);
    const res = new OutgoingMessage();
    return new Cookies(
      new IncomingMessageHeaders(req),
      new OutgoingMessageHeaders(res),
    );
  }

  static fakeOptions(): ParsedOptions {
    return parseOptions({});
  }

  constructor() {
    super(FakeAdapter.fakeCookies(), FakeAdapter.fakeOptions());
  }

  load(): Promise<void> {
    throw new Error();
  }

  commit(): Promise<void> {
    throw new Error();
  }

  protected parseCookie(val: string): unknown {
    throw new Error();
  }

  protected stringifyCookie(data: unknown): string {
    throw new Error();
  }
}
