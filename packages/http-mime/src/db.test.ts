import { MediaType } from "@webfx-http/headers";
import test from "ava";
import { MimeDb } from "./db.js";

test("classify mime type", (t) => {
  t.true(MimeDb.isJson(MediaType.from("application/json")));
  t.true(MimeDb.isText(MediaType.from("text/plain")));
  t.true(MimeDb.isBinary(MediaType.from("application/octet-stream")));
});
