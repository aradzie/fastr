import test from "ava";
import MockDate from "mockdate";
import { TransientStore } from "../store/transient";
import { Setup } from "./test.setup";

test.beforeEach(() => {
  MockDate.set(new Date("2001-01-01T00:00:00Z"));
});

test.serial("manually start session", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const setup = new Setup({ store, autoStart: false });

  // Act.

  const response1 = await setup.agent.get("/");

  // Assert.

  t.is(response1.get("Set-Cookie"), undefined);
  t.deepEqual(response1.body, {});
  t.deepEqual(store.sessions, new Map());

  // Act.

  setup.handle = (session) => {
    session.start();
  };
  const response2 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response2.get("Set-Cookie"), [
    "session=id1; " + "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response2.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: {},
  });
  t.deepEqual(
    store.sessions,
    new Map([
      [
        "id1",
        {
          expires: new Date("2001-01-01T01:00:00Z").getTime() / 1000,
          data: {},
        },
      ],
    ]),
  );
});

test.serial("update session", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const setup = new Setup({ store, autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response1.get("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response1.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });
  t.deepEqual(
    store.sessions,
    new Map([
      [
        "id1",
        {
          expires: new Date("2001-01-01T01:00:00Z").getTime() / 1000,
          data: { count: 1 },
        },
      ],
    ]),
  );

  // Act.

  MockDate.set(new Date("2001-01-01T00:01:00Z"));
  const response2 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response2.get("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:01:00 GMT",
  ]);
  t.deepEqual(response2.body, {
    id: "id1",
    isNew: false,
    expires: "2001-01-01T01:01:00.000Z",
    data: { count: 2 },
  });
  t.deepEqual(
    store.sessions,
    new Map([
      [
        "id1",
        {
          expires: new Date("2001-01-01T01:01:00Z").getTime() / 1000,
          data: { count: 2 },
        },
      ],
    ]),
  );
});

test.serial("regenerate session", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const setup = new Setup({ store, autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response1.get("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response1.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });
  t.deepEqual(
    store.sessions,
    new Map([
      [
        "id1",
        {
          expires: new Date("2001-01-01T01:00:00Z").getTime() / 1000,
          data: { count: 1 },
        },
      ],
    ]),
  );

  // Act.

  setup.handle = (session) => {
    session.regenerate();
  };
  const response2 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response2.get("Set-Cookie"), [
    "session=id2; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response2.body, {
    id: "id2",
    isNew: false,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });
  t.deepEqual(
    store.sessions,
    new Map([
      [
        "id2",
        {
          expires: new Date("2001-01-01T01:00:00Z").getTime() / 1000,
          data: { count: 1 },
        },
      ],
    ]),
  );
});

test.serial("delete session", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const setup = new Setup({ store, autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response1.get("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response1.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });
  t.deepEqual(
    store.sessions,
    new Map([
      [
        "id1",
        {
          expires: new Date("2001-01-01T01:00:00Z").getTime() / 1000,
          data: { count: 1 },
        },
      ],
    ]),
  );

  // Act.

  setup.handle = (session) => {
    session.destroy();
  };
  const response2 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response2.get("Set-Cookie"), [
    "session=; expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ]);
  t.deepEqual(response2.body, {});
  t.deepEqual(store.sessions, new Map());
});

test.serial("ignore invalid session id", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const setup = new Setup({ store, autoStart: false });

  // Act.

  const response1 = await setup.agent.get("/").set("Cookie", "session=invalid");

  // Assert.

  t.is(response1.get("Set-Cookie"), undefined);
  t.deepEqual(response1.body, {});
});

test.serial("ignore invalid session id in autostart session", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const setup = new Setup({ store, autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await setup.agent.get("/").set("Cookie", "session=invalid");

  // Assert.

  t.deepEqual(response1.get("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response1.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });
  t.deepEqual(
    store.sessions,
    new Map([
      [
        "id1",
        {
          expires: new Date("2001-01-01T01:00:00Z").getTime() / 1000,
          data: { count: 1 },
        },
      ],
    ]),
  );
});

test.serial("ignore expired session id", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const setup = new Setup({ store, autoStart: false });
  store.sessions.set("expired", {
    expires: 0,
    data: {},
  });

  // Act.

  const response1 = await setup.agent.get("/").set("Cookie", "session=expired");

  // Assert.

  t.is(response1.get("Set-Cookie"), undefined);
  t.deepEqual(response1.body, {});
  t.deepEqual(store.sessions, new Map());
});
