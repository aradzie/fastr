import { request } from "@webfx-request/node";
import { CookieJar, cookies } from "@webfx-request/testlib";
import test from "ava";
import MockDate from "mockdate";
import { TransientStore } from "../store/transient";
import { Helper } from "./test/helper";

test.beforeEach(() => {
  MockDate.set(new Date("2001-01-01T00:00:00Z"));
});

test.serial("manually start session", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const helper = new Helper({ store, autoStart: false });
  const cookieJar = new CookieJar();

  // Act.

  const response1 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), []);
  t.deepEqual(await response1.body.json(), {});
  t.deepEqual(store.sessions, new Map());

  // Act.

  helper.handle = (session) => {
    session.start();
  };
  const response2 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .send();

  // Assert.

  t.deepEqual(response2.headers.getAll("Set-Cookie"), [
    "session=id1; " + "expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response2.body.json(), {
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
  const helper = new Helper({ store, autoStart: true });
  const cookieJar = new CookieJar();

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response1.body.json(), {
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
  const response2 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .send();

  // Assert.

  t.deepEqual(response2.headers.getAll("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:01:00 GMT",
  ]);
  t.deepEqual(await response2.body.json(), {
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
  const helper = new Helper({ store, autoStart: true });
  const cookieJar = new CookieJar();

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response1.body.json(), {
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

  helper.handle = (session) => {
    session.regenerate();
  };
  const response2 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .send();

  // Assert.

  t.deepEqual(response2.headers.getAll("Set-Cookie"), [
    "session=id2; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response2.body.json(), {
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
  const helper = new Helper({ store, autoStart: true });
  const cookieJar = new CookieJar();

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response1.body.json(), {
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

  helper.handle = (session) => {
    session.destroy();
  };
  const response2 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .send();

  // Assert.

  t.deepEqual(response2.headers.getAll("Set-Cookie"), [
    "session=; expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ]);
  t.deepEqual(await response2.body.json(), {});
  t.deepEqual(store.sessions, new Map());
});

test.serial("ignore invalid session id", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const helper = new Helper({ store, autoStart: false });
  const cookieJar = new CookieJar();

  // Act.

  const response1 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .header("Cookie", "session=invalid")
    .send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), []);
  t.deepEqual(await response1.body.json(), {});
});

test.serial("ignore invalid session id in autostart session", async (t) => {
  // Arrange.

  const store = new TransientStore();
  const helper = new Helper({ store, autoStart: true });
  const cookieJar = new CookieJar();

  // Act.

  MockDate.set(new Date("2001-01-01T00:00:00Z"));
  const response1 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .header("Cookie", "session=invalid")
    .send();
  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), [
    "session=id1; expires=Mon, 01 Jan 2001 01:00:00 GMT",
  ]);
  t.deepEqual(await response1.body.json(), {
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
  const helper = new Helper({ store, autoStart: false });
  const cookieJar = new CookieJar();
  store.sessions.set("expired", {
    expires: 0,
    data: {},
  });

  // Act.

  const response1 = await request
    .get("/")
    .use(cookies(cookieJar))
    .use(helper.server)
    .header("Cookie", "session=expired")
    .send();

  // Assert.

  t.deepEqual(response1.headers.getAll("Set-Cookie"), []);
  t.deepEqual(await response1.body.json(), {});
  t.deepEqual(store.sessions, new Map());
});
