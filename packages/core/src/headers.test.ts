import { IncomingMessage, OutgoingMessage } from "node:http";
import { type Socket } from "node:net";
import test from "ava";
import { IncomingMessageHeaders, OutgoingMessageHeaders } from "./headers.js";

test("incoming", (t) => {
  const message = new IncomingMessage({} as Socket);
  const headers = new IncomingMessageHeaders(message);

  t.deepEqual(headers.names(), []);
  t.is(headers.has("X-Foo"), false);
  t.is(headers.get("X-Foo"), null);
  t.is(headers.getAll("X-Foo"), null);

  message.headers["x-foo"] = "foo";

  t.deepEqual(headers.names(), ["x-foo"]);
  t.is(headers.has("X-Foo"), true);
  t.is(headers.get("X-Foo"), "foo");
  t.throws(() => {
    headers.getAll("X-Foo");
  });

  message.headers["x-foo"] = ["a", "b"];

  t.deepEqual(headers.names(), ["x-foo"]);
  t.is(headers.has("X-Foo"), true);
  t.throws(() => {
    headers.get("X-Foo");
  });
  t.deepEqual(headers.getAll("X-Foo"), ["a", "b"]);
});

test("outgoing", (t) => {
  const message = new OutgoingMessage();
  const headers = new OutgoingMessageHeaders(message);

  // Initial state.

  t.deepEqual(headers.names(), []);
  t.is(headers.has("X-Foo"), false);
  t.is(headers.get("X-Foo"), null);

  // Set a string.

  headers.set("X-Foo", "abc");

  t.deepEqual(headers.names(), ["x-foo"]);
  t.is(headers.has("X-Foo"), true);
  t.is(headers.get("X-Foo"), "abc");

  // Set a number.

  headers.set("X-Foo", 123);

  t.deepEqual(headers.names(), ["x-foo"]);
  t.is(headers.has("X-Foo"), true);
  t.is(headers.get("X-Foo"), "123");

  // Set a mixed array.

  headers.set("X-Foo", ["abc", 123]);

  t.deepEqual(headers.names(), ["x-foo"]);
  t.is(headers.has("X-Foo"), true);
  t.is(headers.get("X-Foo"), "abc, 123");

  // Delete.

  headers.delete("X-FOO");

  t.deepEqual(headers.names(), []);
  t.is(headers.has("X-Foo"), false);
  t.is(headers.get("X-Foo"), null);

  // Append a string.

  headers.append("X-Foo", "abc");

  t.deepEqual(headers.names(), ["x-foo"]);
  t.is(headers.has("X-Foo"), true);
  t.is(headers.get("X-Foo"), "abc");

  // Append a number.

  headers.append("X-Foo", 123);

  t.deepEqual(headers.names(), ["x-foo"]);
  t.is(headers.has("X-Foo"), true);
  t.is(headers.get("X-Foo"), "abc, 123");

  // Append a mixed array.

  headers.append("X-Foo", ["xyz", 456]);

  t.deepEqual(headers.names(), ["x-foo"]);
  t.is(headers.has("X-Foo"), true);
  t.is(headers.get("X-Foo"), "abc, 123, xyz, 456");

  // Clear.

  headers.clear();

  t.deepEqual(headers.names(), []);
  t.is(headers.has("X-Foo"), false);
  t.is(headers.get("X-Foo"), null);
});

test("outgoing Cookie", (t) => {
  const message = new OutgoingMessage();
  const headers = new OutgoingMessageHeaders(message);

  // Initial state.

  t.deepEqual(headers.names(), []);
  t.is(headers.has("Cookie"), false);
  t.is(headers.get("Cookie"), null);

  // Set a string.

  headers.set("Cookie", "abc");

  t.deepEqual(headers.names(), ["cookie"]);
  t.is(headers.has("Cookie"), true);
  t.is(headers.get("Cookie"), "abc");

  // Set a number.

  headers.set("Cookie", 123);

  t.deepEqual(headers.names(), ["cookie"]);
  t.is(headers.has("Cookie"), true);
  t.is(headers.get("Cookie"), "123");

  // Set a mixed array.

  headers.set("Cookie", ["abc", 123]);

  t.deepEqual(headers.names(), ["cookie"]);
  t.is(headers.has("Cookie"), true);
  t.is(headers.get("Cookie"), "abc; 123");

  // Delete.

  headers.delete("COOKIE");

  t.deepEqual(headers.names(), []);
  t.is(headers.has("Cookie"), false);
  t.is(headers.get("Cookie"), null);

  // Append a string.

  headers.append("Cookie", "abc");

  t.deepEqual(headers.names(), ["cookie"]);
  t.is(headers.has("Cookie"), true);
  t.is(headers.get("Cookie"), "abc");

  // Append a number.

  headers.append("Cookie", 123);

  t.deepEqual(headers.names(), ["cookie"]);
  t.is(headers.has("Cookie"), true);
  t.is(headers.get("Cookie"), "abc; 123");

  // Append a mixed array.

  headers.append("Cookie", ["xyz", 456]);

  t.deepEqual(headers.names(), ["cookie"]);
  t.is(headers.has("Cookie"), true);
  t.is(headers.get("Cookie"), "abc; 123; xyz; 456");

  // Clear.

  headers.clear();

  t.deepEqual(headers.names(), []);
  t.is(headers.has("Cookie"), false);
  t.is(headers.get("Cookie"), null);
});

test("outgoing Set-Cookie", (t) => {
  const message = new OutgoingMessage();
  const headers = new OutgoingMessageHeaders(message);

  // Initial state.

  t.deepEqual(headers.names(), []);
  t.is(headers.has("Set-Cookie"), false);
  t.is(headers.getAll("Set-Cookie"), null);

  // Set a string.

  headers.set("Set-Cookie", "abc");

  t.deepEqual(headers.names(), ["set-cookie"]);
  t.is(headers.has("Set-Cookie"), true);
  t.deepEqual(headers.getAll("Set-Cookie"), ["abc"]);

  // Set a number.

  headers.set("Set-Cookie", 123);

  t.deepEqual(headers.names(), ["set-cookie"]);
  t.is(headers.has("Set-Cookie"), true);
  t.deepEqual(headers.getAll("Set-Cookie"), ["123"]);

  // Set a mixed array.

  headers.set("Set-Cookie", ["abc", 123]);

  t.deepEqual(headers.names(), ["set-cookie"]);
  t.is(headers.has("Set-Cookie"), true);
  t.deepEqual(headers.getAll("Set-Cookie"), ["abc", "123"]);

  // Delete.

  headers.delete("Set-Cookie");

  t.deepEqual(headers.names(), []);
  t.is(headers.has("Set-Cookie"), false);
  t.is(headers.getAll("Set-Cookie"), null);

  // Append a string.

  headers.append("Set-Cookie", "abc");

  t.deepEqual(headers.names(), ["set-cookie"]);
  t.is(headers.has("Set-Cookie"), true);
  t.deepEqual(headers.getAll("Set-Cookie"), ["abc"]);

  // Append a number.

  headers.append("Set-Cookie", 123);

  t.deepEqual(headers.names(), ["set-cookie"]);
  t.is(headers.has("Set-Cookie"), true);
  t.deepEqual(headers.getAll("Set-Cookie"), ["abc", "123"]);

  // Append a mixed array.

  headers.append("Set-Cookie", ["xyz", 456]);

  t.deepEqual(headers.names(), ["set-cookie"]);
  t.is(headers.has("Set-Cookie"), true);
  t.deepEqual(headers.getAll("Set-Cookie"), ["abc", "123", "xyz", "456"]);

  // Clear.

  headers.clear();

  t.deepEqual(headers.names(), []);
  t.is(headers.has("Set-Cookie"), false);
  t.is(headers.getAll("Set-Cookie"), null);
});
