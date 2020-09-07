import test from "ava";
import Knex from "knex";
import { SqlStore } from "./sqlstore.js";

const knex = Knex({
  client: "sqlite3",
  useNullAsDefault: true,
  connection: {
    filename: ":memory:",
  },
});

const store = new SqlStore({ knex });

test.beforeEach(async (t) => {
  await store.dropSchema();
  await store.createSchema();
});

test.afterEach(async (t) => {
  await store.dropSchema();
});

test.serial("store", async (t) => {
  // Initially should be empty.
  t.is(await store.load("id1"), null);

  // Delete a missing session.
  await store.destroy("id1");

  // Insert a new session.
  await store.store("id1", {
    expires: 2,
    data: { key: "value" },
  });
  t.deepEqual(await store.load("id1"), {
    expires: 2,
    data: { key: "value" },
  });

  // Update an existing session.
  await store.store("id1", {
    expires: 4,
    data: { key: "fixed" },
  });
  t.deepEqual(await store.load("id1"), {
    expires: 4,
    data: { key: "fixed" },
  });

  // Delete an existing session.
  await store.destroy("id1");
  t.is(await store.load("id1"), null);
});
