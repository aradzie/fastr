import test from "ava";
import { Upgrade } from "./upgrade.js";

test("matches", (t) => {
  const header = new Upgrade();

  t.deepEqual([...header], []);
  t.false(header.has("websocket"));
  t.false(header.has("IRC/6.9"));

  header.add("WebSocket");

  t.deepEqual([...header], ["WebSocket"]);
  t.true(header.has("websocket"));
  t.true(header.has("WEBSOCKET"));
  t.true(header.has("WebSocket"));
  t.false(header.has("IRC/6.9"));

  header.delete("WEBSOCKET");

  t.deepEqual([...header], []);
  t.false(header.has("websocket"));
  t.false(header.has("IRC/6.9"));
});

test("stringify", (t) => {
  const upgrade = new Upgrade();
  upgrade.add("websocket");
  t.is(String(upgrade), "websocket");
  upgrade.add("IRC/6.9");
  upgrade.add("RTA/x11");
  t.is(String(upgrade), "websocket, IRC/6.9, RTA/x11");
});

test("parse", (t) => {
  t.deepEqual(Upgrade.parse("websocket"), new Upgrade("websocket"));
  t.deepEqual(Upgrade.parse("IRC/6.9"), new Upgrade("IRC/6.9"));
  t.deepEqual(
    Upgrade.parse("websocket,IRC/6.9"),
    new Upgrade("websocket", "IRC/6.9"),
  );
  t.deepEqual(
    Upgrade.parse("websocket , IRC/6.9"),
    new Upgrade("websocket", "IRC/6.9"),
  );

  t.throws(() => {
    Upgrade.parse("websocket,");
  });
  t.throws(() => {
    Upgrade.parse(",websocket");
  });
  t.throws(() => {
    Upgrade.parse("=");
  });
});
