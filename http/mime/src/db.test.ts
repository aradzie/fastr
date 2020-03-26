import { MimeType } from "@webfx-http/headers";
import test from "ava";
import { MimeDb } from "./db";

test("classify mime type", (t) => {
  t.true(MimeDb.isJson(MimeType.parse("application/json")));
  t.true(MimeDb.isText(MimeType.parse("text/plain")));
  t.true(MimeDb.isBinary(MimeType.parse("application/octet-stream")));
});
