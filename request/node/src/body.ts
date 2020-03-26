import { MimeType } from "@webfx-http/headers";
import { Json } from "@webfx/request-json";
import { ClientRequest } from "http";
import { pipeline, Readable } from "stream";
import { URLSearchParams } from "url";
import { createGzip } from "zlib";
import { BodyDataType, HttpRequestBody } from "./types";

const GZIP_SIZE_THRESHOLD = 1024;

export function sendBody(
  req: ClientRequest,
  body: BodyDataType | HttpRequestBody | null,
  callback: (err: Error | null) => void,
): void {
  if (body == null) {
    callback(null);
  } else {
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
}

type BufferPayload = {
  readonly kind: "buffer";
  readonly type: MimeType | string;
  readonly buffer: Buffer;
  readonly compressible: boolean;
};

type StreamPayload = {
  readonly kind: "stream";
  readonly type: MimeType | string;
  readonly stream: Readable;
  readonly compressible: boolean;
};

function toPayload(
  body: any,
  type: MimeType | string | null = null,
  compressible = false,
): BufferPayload | StreamPayload {
  // Plain text body.
  if (typeof body === "string") {
    type = type ?? "text/plain";
    const buffer = Buffer.from(body);
    return { kind: "buffer", type, buffer, compressible };
  }

  // JSON body.
  if (body instanceof Json) {
    type = type ?? "application/json";
    const buffer = Buffer.from(body.stringify());
    return { kind: "buffer", type, buffer, compressible };
  }

  // Form body.
  if (body instanceof URLSearchParams) {
    type = type ?? "application/x-www-form-urlencoded";
    const buffer = Buffer.from(String(body));
    return { kind: "buffer", type, buffer, compressible };
  }

  // Arbitrary binary data body.
  if (Buffer.isBuffer(body)) {
    type = type ?? "application/octet-stream";
    const buffer = body;
    return { kind: "buffer", type, buffer, compressible };
  }

  // Arbitrary binary data body.
  if (body instanceof ArrayBuffer) {
    type = type ?? "application/octet-stream";
    const buffer = Buffer.from(body);
    return { kind: "buffer", type, buffer, compressible };
  }

  // Arbitrary binary data body.
  if (ArrayBuffer.isView(body)) {
    type = type ?? "application/octet-stream";
    const buffer = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    return { kind: "buffer", type, buffer, compressible };
  }

  // Arbitrary binary data body.
  if (body instanceof Readable) {
    type = type ?? "application/octet-stream";
    return { kind: "stream", type, stream: body, compressible };
  }

  // Extended body properties.
  if (body.data != null) {
    const { type = null, data, compressible = false } = body as HttpRequestBody;
    return toPayload(data, type, compressible);
  }

  throw new TypeError("Invalid body type");
}

function sendBuffer(
  req: ClientRequest,
  { type, buffer, compressible }: BufferPayload,
  callback: (err: Error | null) => void,
): void {
  if (type != null) {
    req.setHeader("Content-Type", String(type));
  }
  const { length } = buffer;
  if (compressible && length > GZIP_SIZE_THRESHOLD) {
    req.setHeader("Content-Encoding", "gzip");
    pipeline(Readable.from([buffer]), createGzip(), req, callback);
  } else {
    req.setHeader("Content-Length", length);
    pipeline(Readable.from([buffer]), req, callback);
  }
}

function sendStream(
  req: ClientRequest,
  { type, stream, compressible }: StreamPayload,
  callback: (err: Error | null) => void,
): void {
  if (stream.destroyed) {
    throw new Error("Stream destroyed");
  }
  if (type != null) {
    req.setHeader("Content-Type", String(type));
  }
  if (compressible) {
    req.setHeader("Content-Encoding", "gzip");
    pipeline(stream, createGzip(), req, callback);
  } else {
    pipeline(stream, req, callback);
  }
}
