import test from "ava";
import { guessContentType, toFormData } from "./body";

test("use custom type", (t) => {
  t.is(guessContentType("text", "foo/bar")[1], "foo/bar");
});

test("guess text type", (t) => {
  t.is(guessContentType("text", null)[1], "text/plain");
});

test("guess form type", (t) => {
  t.is(guessContentType(new FormData(), null)[1], "multipart/form-data");
  t.is(
    guessContentType(new URLSearchParams(), null)[1],
    "application/x-www-form-urlencoded",
  );
});

test("guess type from blob", (t) => {
  t.is(guessContentType(new Blob([]), null)[1], "application/octet-stream");
  t.is(
    guessContentType(new Blob([], { type: "text/plain" }), null)[1],
    "text/plain",
  );
});

test("guess binary type", (t) => {
  t.is(
    guessContentType(new ArrayBuffer(0), null)[1],
    "application/octet-stream",
  );
  t.is(
    guessContentType(new Uint8Array(0), null)[1],
    "application/octet-stream",
  );
});

test("guess json type", (t) => {
  t.is(guessContentType(new Map(), null)[1], "application/json"); // OMG
  t.is(guessContentType({}, null)[1], "application/json");
  t.is(guessContentType([], null)[1], "application/json");
});

test("to form data", (t) => {
  t.is(toFormData(new FormData())[1], "multipart/form-data");
  t.is(
    toFormData(new URLSearchParams())[1],
    "application/x-www-form-urlencoded",
  );
  t.is(toFormData(new Map())[1], "application/x-www-form-urlencoded");
  t.is(toFormData({})[1], "application/x-www-form-urlencoded");
  t.is(toFormData([])[1], "application/x-www-form-urlencoded");
});
