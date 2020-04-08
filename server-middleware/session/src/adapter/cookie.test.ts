import test from "ava";
import MockDate from "mockdate";
import { Helper } from "./test/helper";

test.beforeEach(() => {
  MockDate.set(new Date("2001-01-01T00:00:00Z"));
});

test.serial("manually start session", async (t) => {
  // Arrange.

  const helper = new Helper({ store: "cookie", autoStart: false });

  // Act.

  const response1 = await helper.request.get("/").send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), []);
  t.deepEqual(await response1.body.json(), {});

  // Act.

  helper.handle = (session): void => {
    session.start();
  };
  const response2 = await helper.request.get("/").send();

  // Assert.

  t.deepEqual(response2.headers.getAll("Set-Cookie"), [
    "session=GQAAAAJAaQAEAAAAaWQxABBAZQCQ1k86AA==; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response2.body.json(), {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: {},
  });
});

test.serial("update session", async (t) => {
  // Arrange.

  const helper = new Helper({ store: "cookie", autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await helper.request.get("/").send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDEAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response1.body.json(), {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });

  // Act.

  MockDate.set(new Date("2001-01-01T00:01:00Z"));
  const response2 = await helper.request.get("/").send();

  // Assert.

  t.deepEqual(response2.headers.getAll("Set-Cookie"), [
    "session=JAAAABBjb3VudAACAAAAAkBpAAQAAABpZDEAEEBlAMzWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:01:00 GMT",
  ]);
  t.deepEqual(await response2.body.json(), {
    id: "id1",
    isNew: false,
    expires: "2001-01-01T01:01:00.000Z",
    data: { count: 2 },
  });
});

test.serial("regenerate session", async (t) => {
  // Arrange.

  const helper = new Helper({ store: "cookie", autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await helper.request.get("/").send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDEAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response1.body.json(), {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });

  // Act.

  helper.handle = (session): void => {
    session.regenerate();
  };
  const response2 = await helper.request.get("/").send();

  // Assert.

  t.deepEqual(response2.headers.getAll("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDIAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response2.body.json(), {
    id: "id2",
    isNew: false,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });
});

test.serial("delete session", async (t) => {
  // Arrange.

  const helper = new Helper({ store: "cookie", autoStart: true });

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await helper.request.get("/").send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDEAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response1.body.json(), {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });

  // Act.

  helper.handle = (session): void => {
    session.destroy();
  };
  const response2 = await helper.request.get("/").send();

  // Assert.

  t.deepEqual(response2.headers.getAll("Set-Cookie"), [
    "session=; expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ]);
  t.deepEqual(await response2.body.json(), {}); // TODO Check body.
});

test.serial("ignore invalid session id", async (t) => {
  // Arrange.

  const helper = new Helper({ store: "cookie", autoStart: false });

  // Act.

  const response1 = await helper.request
    .get("/")
    .header("Cookie", "session=invalid")
    .send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), []);
  t.deepEqual(await response1.body.json(), {});
});

test.serial("ignore invalid session id in autostart session", async (t) => {
  // Arrange.

  const helper = new Helper({ store: "cookie", autoStart: true });

  // Act.

  const response1 = await helper.request
    .get("/")
    .header("Cookie", "session=invalid")
    .send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), [
    "session=JAAAABBjb3VudAABAAAAAkBpAAQAAABpZDEAEEBlAJDWTzoA; " +
      "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response1.body.json(), {
    id: "id1",
    isNew: true,
    expires: "2001-01-01T01:00:00.000Z",
    data: { count: 1 },
  });
});
