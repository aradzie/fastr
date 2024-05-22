import { brotliCompressSync, gzipSync } from "node:zlib";
import { BadRequestError, PayloadTooLargeError } from "@fastr/errors";
import { FakeIncomingMessage } from "@fastr/fake-http";
import test from "ava";
import { Body } from "./body.js";

test("parse buffer body", async (t) => {
  t.deepEqual(
    await Body.from(new FakeIncomingMessage("")).buffer(),
    Buffer.from(""),
  );
  t.deepEqual(
    await Body.from(new FakeIncomingMessage("buffer")).buffer(),
    Buffer.from("buffer"),
  );
});

test("parse text body", async (t) => {
  t.is(await Body.from(new FakeIncomingMessage("")).text(), "");
  t.is(await Body.from(new FakeIncomingMessage("text")).text(), "text");
  t.is(
    await Body.from(
      new FakeIncomingMessage(Buffer.from("text", "utf8"), {
        headers: { "content-type": "text/plain; charset=UTF8" },
      }),
    ).text(),
    "text",
  );
  t.is(
    await Body.from(
      new FakeIncomingMessage(Buffer.from("text", "utf16le"), {
        headers: { "content-type": "text/plain; charset=UTF16LE" },
      }),
    ).text(),
    "text",
  );
  t.is(
    await Body.from(
      new FakeIncomingMessage(Buffer.from("text", "latin1"), {
        headers: { "content-type": "text/plain; charset=ISO-8859-1" },
      }),
    ).text(),
    "text",
  );
  t.is(
    await Body.from(
      new FakeIncomingMessage(Buffer.from("text", "ascii"), {
        headers: { "content-type": "text/plain; charset=Ascii" },
      }),
    ).text(),
    "text",
  );
});

test("parse json body", async (t) => {
  t.deepEqual(
    await Body.from(new FakeIncomingMessage('{"json":true}')).json(),
    { json: true },
  );
  t.deepEqual(
    await Body.from(
      new FakeIncomingMessage(Buffer.from('{"json":true}', "utf16le"), {
        headers: { "content-type": "application/json; charset=utf16le" },
      }),
    ).json(),
    { json: true },
  );
});

test("parse form body", async (t) => {
  t.deepEqual(await Body.from(new FakeIncomingMessage("")).form(), {});
  t.deepEqual(await Body.from(new FakeIncomingMessage("form=true")).form(), {
    form: "true",
  });
  t.deepEqual(
    await Body.from(
      new FakeIncomingMessage(Buffer.from("form=true", "utf16le"), {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=utf16le",
        },
      }),
    ).form(),
    { form: "true" },
  );
});

test("use body once", async (t) => {
  const body = Body.from(new FakeIncomingMessage("buffer"));

  t.false(body.bodyUsed);

  await body.buffer();

  t.true(body.bodyUsed);

  await t.throwsAsync(body.buffer(), {
    message: "Body already used",
  });
  await t.throwsAsync(body.text(), {
    message: "Body already used",
  });
  await t.throwsAsync(body.json(), {
    message: "Body already used",
  });
  await t.throwsAsync(body.form(), {
    message: "Body already used",
  });
});

test("demand binary stream", async (t) => {
  const req = new FakeIncomingMessage("buffer");
  req.setEncoding("utf8");

  await t.throwsAsync(Body.from(req).buffer(), {
    instanceOf: Error,
    message: "Not a binary stream",
  });
});

test("honor length limit", async (t) => {
  {
    const req = new FakeIncomingMessage("body");
    t.false(req.isPaused());
    const body = Body.from(req, { maxLength: 3 });
    await t.throwsAsync(body.text(), {
      instanceOf: PayloadTooLargeError,
      message: "Payload Too Large",
    });
    t.true(req.isPaused());
  }

  {
    const req = new FakeIncomingMessage("body", {
      headers: { "content-length": "4" },
    });
    t.false(req.isPaused());
    const body = Body.from(req, { maxLength: 3 });
    await t.throwsAsync(body.text(), {
      instanceOf: PayloadTooLargeError,
      message: "Payload Too Large",
    });
    t.true(req.isPaused());
  }

  {
    const req = new FakeIncomingMessage("body");
    t.false(req.isPaused());
    t.is(await Body.from(req, { maxLength: 4 }).text(), "body");
    t.false(req.isPaused());
  }
});

test("decompress data", async (t) => {
  const data = "data".repeat(1000);
  const gzip = compress("gzip", data);
  const br = compress("br", data);

  t.is(
    await Body.from(
      new FakeIncomingMessage(data, {
        headers: { "content-encoding": "identity" },
      }),
    ).text(),
    data,
  );
  t.is(
    await Body.from(
      new FakeIncomingMessage(gzip, {
        headers: { "content-encoding": "gzip" },
      }),
    ).text(),
    data,
  );
  t.is(
    await Body.from(
      new FakeIncomingMessage(gzip, {
        headers: { "content-encoding": "deflate" },
      }),
    ).text(),
    data,
  );
  t.is(
    await Body.from(
      new FakeIncomingMessage(br, {
        headers: { "content-encoding": "br" },
      }),
    ).text(),
    data,
  );
});

test("handle invalid compressed data", async (t) => {
  t.throws(
    () => {
      Body.from(
        new FakeIncomingMessage("body", {
          headers: { "content-encoding": "invalid" },
        }),
      );
    },
    {
      instanceOf: BadRequestError,
      message: "Invalid content encoding [invalid]",
    },
  );
  await t.throwsAsync(
    Body.from(
      new FakeIncomingMessage("invalid", {
        headers: { "content-encoding": "gzip" },
      }),
    ).text(),
    {
      instanceOf: BadRequestError,
      message: "Invalid gzip data",
    },
  );
  await t.throwsAsync(
    Body.from(
      new FakeIncomingMessage("invalid", {
        headers: { "content-encoding": "deflate" },
      }),
    ).text(),
    {
      instanceOf: BadRequestError,
      message: "Invalid gzip data",
    },
  );
  await t.throwsAsync(
    Body.from(
      new FakeIncomingMessage("invalid", {
        headers: { "content-encoding": "br" },
      }),
    ).text(),
    {
      instanceOf: BadRequestError,
      message: "Invalid brotli data",
    },
  );
});

test("read from destroyed stream", async (t) => {
  const req = new FakeIncomingMessage("buffer");
  req.destroy();

  await t.throwsAsync(Body.from(req).buffer(), {
    name: "Error",
    message: "Destroyed stream",
  });
});

function compress(method: "gzip" | "br", input: string | Buffer): Buffer {
  if (typeof input === "string") {
    input = Buffer.from(input);
  }
  switch (method) {
    case "gzip":
      return gzipSync(input);
    case "br":
      return brotliCompressSync(input);
    default:
      throw new Error();
  }
}
