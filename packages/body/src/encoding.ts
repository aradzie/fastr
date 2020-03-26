import { BadRequestError, PayloadTooLargeError } from "@fastr/errors";
import { type Readable } from "stream";
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
    case "gzip":
    case "deflate":
      return gzip;
    case "br":
      return brotli;
    default:
      throw new BadRequestError("Invalid content encoding");
  }
}

export function readAll({
  maxLength,
  length,
  encoding,
  stream,
}: {
  readonly maxLength: number | null;
  readonly length: number | null;
  readonly encoding: Encoding;
  readonly stream: Readable;
}): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    if (stream.destroyed) {
      reject(new Error("Destroyed stream"));
      return;
    }

    if (maxLength != null && length != null && length > maxLength) {
      stream.pause();
      reject(new PayloadTooLargeError());
      return;
    }

    let chunks: Buffer[] = [];
    let received = 0;

    const onData = (chunk: Buffer): void => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
        received += chunk.length;
        if (maxLength != null && received > maxLength) {
          onError(new PayloadTooLargeError());
        }
      } else {
        onError(new TypeError("Not a binary stream"));
      }
    };

    const onEnd = (): void => {
      cleanup();
      resolve(Buffer.concat(chunks));
    };

    const onClose = (): void => {
      cleanup();
      resolve(Buffer.concat(chunks));
    };

    const onError = (err: Error): void => {
      chunks = [];
      received = 0;
      stream.pause();
      cleanup();
      reject(err);
    };

    const cleanup = (): void => {
      decoder.off("data", onData);
      decoder.off("end", onEnd);
      decoder.off("close", onClose);
      stream.off("error", onError);
    };

    const decoder = encoding.decoder(stream);
    decoder.on("data", onData);
    decoder.on("end", onEnd);
    decoder.on("close", onClose);
    stream.on("error", onError);
  });
}
