import { type NameValueEntries } from "@fastr/headers";
import { type OutgoingMessage } from "http";
import { Readable, type Writable } from "stream";
import { Streamable } from "./streamable.js";
import { type BodyDataType } from "./type.js";

export function sendBody(
  message: OutgoingMessage,
  body: BodyDataType | null,
): void {
  const payload = toPayload(body);
  for (const [name, value] of payload.headers) {
    if (value != null) {
      message.setHeader(name, String(value));
    } else {
      message.removeHeader(name);
    }
  }
  payload.send(message);
}

export type Payload = {
  readonly headers: NameValueEntries;
  readonly send: (message: Writable) => void;
};

export function toPayload(body: BodyDataType): Payload {
  if (body == null) {
    return {
      headers: [
        ["Content-Type", null],
        ["Content-Length", null],
        ["Content-Encoding", null],
        ["Transfer-Encoding", null],
      ],
      send: (message) => {
        message.end();
      },
    };
  }

  if (typeof body === "string") {
    return {
      headers: [["Content-Length", Buffer.byteLength(body)]],
      send: (message) => {
        message.end(body);
      },
    };
  }

  if (Buffer.isBuffer(body)) {
    return {
      headers: [["Content-Length", body.byteLength]],
      send: (message) => {
        message.end(body);
      },
    };
  }

  if (body instanceof Readable) {
    return {
      headers: [],
      send: (message) => {
        pipe(body, message);
      },
    };
  }

  if (body instanceof Streamable) {
    return {
      headers: [["Content-Length", body.length()]],
      send: (message) => {
        pipe(body.open(), message);
      },
    };
  }

  throw new TypeError(
    `Invalid body type ${Object.prototype.toString.call(body)}`,
  );
}

function pipe(source: Readable, target: Writable): void {
  // TODO Check this function again. Also consider the `pipeline` function. Write tests.
  source.pipe(target, { end: true });
  source.on("error", (err) => {
    source.unpipe(target);
    // TODO source.destroy();
    target.emit("error", err);
  });
}
