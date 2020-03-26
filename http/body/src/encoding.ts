import { BadRequestError, PayloadTooLargeError } from "@webfx-http/error";
import { Readable } from "stream";
import { createBrotliDecompress, createUnzip } from "zlib";

export interface Encoding {
  decoder(stream: Readable): Readable;
}

export const identity = new (class IdentityEncoding implements Encoding {
  decoder(stream: Readable): Readable {
    return stream;
  }
})();

export const gzip = new (class GzipEncoding implements Encoding {
  decoder(stream: Readable): Readable {
    const decoder = createUnzip();
    stream.pipe(decoder);
    decoder.on("error", () => {
      stream.unpipe(decoder);
      stream.emit("error", new BadRequestError("Invalid gzip data"));
    });
    return decoder;
  }
})();

export const brotli = new (class BrotliEncoding implements Encoding {
  decoder(stream: Readable): Readable {
    const decoder = createBrotliDecompress();
    stream.pipe(decoder);
    decoder.on("error", () => {
      stream.unpipe(decoder);
      stream.emit("error", new BadRequestError("Invalid brotli data"));
    });
    return decoder;
  }
})();

export function getEncoding(name: string): Encoding {
  switch (name) {
    case "identity":
      return identity;
    case "deflate":
    case "gzip":
      return gzip;
    case "br":
      return brotli;
    default:
      throw new BadRequestError("Invalid content encoding");
  }
}

export function readAll({
  lengthLimit,
  length,
  encoding,
  stream,
}: {
  readonly lengthLimit: number | null;
  readonly length: number | null;
  readonly encoding: Encoding;
  readonly stream: Readable;
}): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    if (stream.destroyed) {
      reject(new Error("Destroyed stream"));
      return;
    }

    const chunks: Buffer[] = [];
    let received = 0;

    const decoder = encoding.decoder(stream);
    decoder.on("data", onData);
    decoder.on("end", onEnd);
    stream.on("error", onError);

    if (lengthLimit != null && length != null && length > lengthLimit) {
      onError(new PayloadTooLargeError());
      return;
    }

    function cleanup(): void {
      decoder.off("data", onData);
      decoder.off("end", onEnd);
      stream.off("error", onError);
    }

    function onData(chunk: Buffer): void {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
        received += chunk.length;
        if (lengthLimit != null && received > lengthLimit) {
          onError(new PayloadTooLargeError());
        }
      } else {
        onError(new TypeError("Not a binary stream"));
      }
    }

    function onEnd(): void {
      cleanup();
      resolve(Buffer.concat(chunks));
    }

    function onError(err: Error): void {
      stream.pause(); // Stop reading from the incoming message stream.
      cleanup();
      reject(err);
    }
  });
}
