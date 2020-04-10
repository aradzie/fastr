import { OutgoingMessage } from "http";
import { pipeline, Readable } from "stream";
import { createGzip } from "zlib";
import type { BodyDataType } from "../types";
import { Streamable } from "./streamable";

const GZIP_SIZE_THRESHOLD = 1024;

export function isStreamBody(body: BodyDataType | null): boolean {
  return body instanceof Readable;
}

export function sendBody(
  req: OutgoingMessage,
  body: BodyDataType,
  callback: (err: Error | null) => void,
): void {
  const payload = toPayload(body);
  switch (payload.kind) {
    case "buffer":
      sendBuffer(req, payload, callback);
      break;
    case "stream":
      sendStream(req, payload, callback);
      break;
  }
}

type BufferPayload = {
  readonly kind: "buffer";
  readonly data: Buffer;
  readonly compressible: boolean;
};

type StreamPayload = {
  readonly kind: "stream";
  readonly stream: Readable;
  readonly compressible: boolean;
};

function toPayload(
  body: BodyDataType,
  compressible = false,
): BufferPayload | StreamPayload {
  if (typeof body === "string") {
    return {
      kind: "buffer",
      data: Buffer.from(body),
      compressible,
    };
  }

  if (Buffer.isBuffer(body)) {
    return {
      kind: "buffer",
      data: body,
      compressible,
    };
  }

  if (body instanceof Readable) {
    return {
      kind: "stream",
      stream: body,
      compressible,
    };
  }

  if (body instanceof Streamable) {
    return {
      kind: "stream",
      stream: body.open(),
      compressible,
    };
  }

  throw new TypeError("Invalid body type");
}

function sendBuffer(
  req: OutgoingMessage,
  { data, compressible }: BufferPayload,
  callback: (err: Error | null) => void,
): void {
  const { byteLength } = data;
  const stream = Readable.from([data]);
  if (compressible && byteLength >= GZIP_SIZE_THRESHOLD) {
    req.setHeader("Content-Encoding", "gzip");
    pipeline(stream, createGzip(), req, callback);
  } else {
    req.setHeader("Content-Length", byteLength);
    pipeline(stream, req, callback);
  }
}

function sendStream(
  req: OutgoingMessage,
  { stream, compressible }: StreamPayload,
  callback: (err: Error | null) => void,
): void {
  if (stream.destroyed) {
    throw new Error("Stream destroyed");
  }
  if (compressible) {
    req.setHeader("Content-Encoding", "gzip");
    pipeline(stream, createGzip(), req, callback);
  } else {
    pipeline(stream, req, callback);
  }
}
