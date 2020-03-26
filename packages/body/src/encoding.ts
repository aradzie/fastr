import { BadRequestError, PayloadTooLargeError } from "@fastr/errors";
import { type Readable, type Transform } from "stream";
import {
  type BrotliOptions,
  createBrotliCompress,
  createBrotliDecompress,
  createGunzip,
  createGzip,
  type ZlibOptions,
} from "zlib";

export interface Encoding {
  get id(): string;
  encoder(): Transform;
  decoder(): Transform;
  encode(stream: Readable): Readable;
  decode(stream: Readable): Readable;
}

export class IdentityEncoding implements Encoding {
  get id(): string {
    return "identity";
  }

  encoder(): Transform {
    throw new TypeError("Not supported");
  }

  decoder(): Transform {
    throw new TypeError("Not supported");
  }

  encode(stream: Readable): Readable {
    return stream;
  }

  decode(stream: Readable): Readable {
    return stream;
  }
}

export class GzipEncoding implements Encoding {
  constructor(private readonly options?: ZlibOptions) {}

  get id(): string {
    return "gzip";
  }

  encoder(): Transform {
    return createGzip(this.options);
  }

  decoder(): Transform {
    return createGunzip(this.options);
  }

  encode(stream: Readable): Readable {
    const transform = this.encoder();
    stream.pipe(transform, { end: true });
    transform.on("error", (err) => {
      stream.unpipe(transform);
      stream.emit("error", err);
    });
    return transform;
  }

  decode(stream: Readable): Readable {
    const transform = this.decoder();
    stream.pipe(transform, { end: true });
    transform.on("error", () => {
      stream.unpipe(transform);
      stream.emit("error", new BadRequestError("Invalid gzip data"));
    });
    return transform;
  }
}

export class BrotliEncoding implements Encoding {
  constructor(private readonly options?: BrotliOptions) {}

  get id(): string {
    return "br";
  }

  encoder(): Transform {
    return createBrotliCompress(this.options);
  }

  decoder(): Transform {
    return createBrotliDecompress(this.options);
  }

  encode(stream: Readable): Readable {
    const transform = this.encoder();
    stream.pipe(transform, { end: true });
    transform.on("error", (err) => {
      stream.unpipe(transform);
      stream.emit("error", err);
    });
    return transform;
  }

  decode(stream: Readable): Readable {
    const transform = this.decoder();
    stream.pipe(transform, { end: true });
    transform.on("error", () => {
      stream.unpipe(transform);
      stream.emit("error", new BadRequestError("Invalid brotli data"));
    });
    return transform;
  }
}

export const getEncoding = (id: string): Encoding => {
  switch (id) {
    case "identity":
      return new IdentityEncoding();
    case "gzip":
    case "deflate":
      return new GzipEncoding();
    case "br":
      return new BrotliEncoding();
    default:
      throw new BadRequestError(`Invalid content encoding [${id}]`);
  }
};

export const readAll = ({
  maxLength,
  length,
  encoding,
  stream,
}: {
  readonly maxLength: number | null;
  readonly length: number | null;
  readonly encoding: Encoding;
  readonly stream: Readable;
}): Promise<Buffer> => {
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

    const decoder = encoding.decode(stream);
    decoder.on("data", onData);
    decoder.on("end", onEnd);
    decoder.on("close", onClose);
    stream.on("error", onError);
  });
};
