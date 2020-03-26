import test from "ava";
import { Forwarded } from "./forwarded.js";

test("manipulate header", (t) => {
  const header = new Forwarded();

  t.is(header.by, null);
  t.is(header.for, null);
  t.is(header.host, null);
  t.is(header.proto, null);

  header.host = "host1";

  t.is(header.by, null);
  t.is(header.for, null);
  t.is(header.host, "host1");
  t.is(header.proto, null);

  header.proto = "http";

  t.is(header.by, null);
  t.is(header.for, null);
  t.is(header.host, "host1");
  t.is(header.proto, "http");
});

test("stringify", (t) => {
  t.is(
    String(
      new Forwarded({
        by: "[2001:db8:cafe::17]:47011",
        for: "unknown",
        host: "[2001:db8:cafe::17]:4711",
        proto: "http",
      }),
    ),
    `by="[2001:db8:cafe::17]:47011"; ` +
      `for=unknown; ` +
      `host="[2001:db8:cafe::17]:4711"; ` +
      `proto=http`,
  );
});

test("parse", (t) => {
  t.deepEqual(Forwarded.parse(`by=unknown`), new Forwarded({ by: "unknown" }));
  t.deepEqual(
    Forwarded.parse(`by="[2001:db8:cafe::17]:4711"`),
    new Forwarded({ by: "[2001:db8:cafe::17]:4711" }),
  );
  t.deepEqual(
    Forwarded.parse(`for=unknown`),
    new Forwarded({ for: "unknown" }),
  );
  t.deepEqual(
    Forwarded.parse(`for="[2001:db8:cafe::17]:4711"`),
    new Forwarded({ for: "[2001:db8:cafe::17]:4711" }),
  );
  t.deepEqual(
    Forwarded.parse(`host="[2001:db8:cafe::17]:4711"`),
    new Forwarded({ host: "[2001:db8:cafe::17]:4711" }),
  );
  t.deepEqual(Forwarded.parse(`proto=http`), new Forwarded({ proto: "http" }));
  t.deepEqual(
    Forwarded.parse(
      `by=203.0.113.43;` +
        `for="[2001:db8:cafe::17]:4711";` +
        `host = localhost;` +
        `proto=http`,
    ),
    new Forwarded({
      by: "203.0.113.43",
      for: "[2001:db8:cafe::17]:4711",
      host: "localhost",
      proto: "http",
    }),
  );
  t.deepEqual(
    Forwarded.parse(
      `by=203.0.113.43 ; ` +
        `for="[2001:db8:cafe::17]:4711" ; ` +
        `host = localhost ; ` +
        `proto=http `,
    ),
    new Forwarded({
      by: "203.0.113.43",
      for: "[2001:db8:cafe::17]:4711",
      host: "localhost",
      proto: "http",
    }),
  );
});
