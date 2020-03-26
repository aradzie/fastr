import test from "ava";
import { TransientStore } from "./transient";

test("store and load", async (t) => {
  const store = new TransientStore();

  // Initially should be empty.
  t.is(await store.load("session_id"), null);

  // Delete a missing session.
  await store.destroy("session_id");

  // Insert a new session.
  await store.store("session_id", {
    expires: null,
    data: { key: "value" },
  });
  t.deepEqual(await store.load("session_id"), {
    expires: null,
    data: { key: "value" },
  });

  // Delete an existing session.
  await store.destroy("session_id");
  t.is(await store.load("session_id"), null);
});
