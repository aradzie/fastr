import test from "ava";
import { type MediaTypeInfo, MediaTypes } from "./mediatypes.js";

test("lookup by type", (t) => {
  t.like(MediaTypes.lookup("TEXT/PLAIN; charset=UTF-8"), {
    type: "text/plain",
    text: true,
    compressible: true,
  });
  t.like(MediaTypes.lookup("text/html"), {
    type: "text/html",
    text: true,
    compressible: true,
  });
  t.like(MediaTypes.lookup("text/xml"), {
    type: "text/xml",
    text: true,
    compressible: true,
  });
  t.like(MediaTypes.lookup("text/css"), {
    type: "text/css",
    text: true,
    compressible: true,
  });
  t.like(MediaTypes.lookup("application/json"), {
    type: "application/json",
    text: true,
    compressible: true,
  });
  t.like(MediaTypes.lookup("application/octet-stream"), {
    type: "application/octet-stream",
    text: false,
    compressible: true,
  });
  t.like(MediaTypes.lookup("image/jpeg"), {
    type: "image/jpeg",
    text: false,
    compressible: false,
  });
  t.like(MediaTypes.lookup("audio/ogg"), {
    type: "audio/ogg",
    text: false,
    compressible: false,
  });
  t.like(MediaTypes.lookup("video/ogg"), {
    type: "video/ogg",
    text: false,
    compressible: false,
  });
});

test("lookup by unknown type", (t) => {
  t.is(MediaTypes.lookup("unknown/type"), null);
});

test("lookup by ext", (t) => {
  t.like(MediaTypes.lookupByExt("txt"), {
    type: "text/plain",
    text: true,
    compressible: true,
  });
  t.like(MediaTypes.lookupByExt(".txt"), {
    type: "text/plain",
    text: true,
    compressible: true,
  });
  t.like(MediaTypes.lookupByExt(".TXT"), {
    type: "text/plain",
    text: true,
    compressible: true,
  });
  t.like(MediaTypes.lookupByExt("css"), {
    type: "text/css",
    text: true,
    compressible: true,
  });
  t.like(MediaTypes.lookupByExt("js"), {
    type: "text/javascript",
    text: true,
    compressible: true,
  });
});

test("lookup by unknown ext", (t) => {
  t.is(MediaTypes.lookupByExt("unknown-ext"), null);
});

test("register", (t) => {
  // Arrange.

  const info: MediaTypeInfo = {
    type: "omg/unknown-type",
    ext: ["omg-unknown-ext"],
    text: false,
    compressible: true,
  };

  // Act.

  MediaTypes.register(info);

  // Assert.

  t.deepEqual(MediaTypes.lookup("omg/unknown-type"), info);
  t.deepEqual(MediaTypes.lookupByExt("omg-unknown-ext"), info);
});
