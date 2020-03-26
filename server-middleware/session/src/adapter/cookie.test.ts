import test from "ava";
import MockDate from "mockdate";
import { Setup } from "./test.setup";

test.beforeEach((t) => {
  MockDate.set(new Date("2001-01-01T00:00:00Z"));
});

test.serial("manually start session", async (t) => {
  // Arrange.

  const setup = new Setup({ store: "cookie", autoStart: false });

  // Act.

  const response1 = await setup.agent.get("/");

  // Assert.

  t.is(response1.get("Set-Cookie"), undefined);
  t.deepEqual(response1.body, {});

  // Act.

  setup.handle = (session) => {
    session.start();
  };
  const response2 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response2.get("Set-Cookie"), [
    "session=GQAAAAJAaQAEAAAAaWQxABBAZQCQ1k86AA==; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response2.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: {},
  });
});

test.serial("update session", async (t) => {
  // Arrange.

  const setup = new Setup({ store: "cookie", autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response1.get("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDEAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response1.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });

  // Act.

  MockDate.set(new Date("2001-01-01T00:01:00Z"));
  const response2 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response2.get("Set-Cookie"), [
    "session=JAAAABBjb3VudAACAAAAAkBpAAQAAABpZDEAEEBlAMzWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:01:00 GMT",
  ]);
  t.deepEqual(response2.body, {
    id: "id1",
    isNew: false,
    expires: "2001-01-01T01:01:00.000Z",
    data: { count: 2 },
  });
});

test.serial("regenerate session", async (t) => {
  // Arrange.

  const setup = new Setup({ store: "cookie", autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response1.get("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDEAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response1.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });

  // Act.

  setup.handle = (session) => {
    session.regenerate();
  };
  const response2 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response2.get("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDIAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response2.body, {
    id: "id2",
    isNew: false,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });
});

test.serial("delete session", async (t) => {
  // Arrange.

  const setup = new Setup({ store: "cookie", autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response1.get("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDEAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response1.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });

  // Act.

  setup.handle = (session) => {
    session.destroy();
  };
  const response2 = await setup.agent.get("/");

  // Assert.

  t.deepEqual(response2.get("Set-Cookie"), [
    "session=; expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ]);
});

test.serial("ignore invalid session id", async (t) => {
  // Arrange.

  const setup = new Setup({ store: "cookie", autoStart: false });

  // Act.

  const response1 = await setup.agent.get("/").set("Cookie", "session=invalid");

  // Assert.

  t.is(response1.get("Set-Cookie"), undefined);
  t.deepEqual(response1.body, {});
});

test.serial("ignore invalid session id in autostart session", async (t) => {
  // Arrange.

  const setup = new Setup({ store: "cookie", autoStart: true });

  // Act.

  const response1 = await setup.agent.get("/").set("Cookie", "session=invalid");

  // Assert.

  t.deepEqual(response1.get("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDEAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(response1.body, {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });
});
