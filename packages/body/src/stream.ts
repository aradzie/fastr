import { Readable, type Writable } from "stream";

export function discardBody(body: unknown): void {
  if (isStreamBody(body)) {
    body.destroy(); // TODO Close body stream.
  }
}

export function isStreamBody(body: unknown): body is Readable {
  return body instanceof Readable;
}

export async function readStreamBody(body: Readable): Promise<Buffer> {
  const buffers: Buffer[] = [];
  for await (const item of body) {
    if (typeof item === "string") {
      buffers.push(Buffer.from(item));
    } else {
      buffers.push(item);
    }
  }
  return Buffer.concat(buffers);
}
