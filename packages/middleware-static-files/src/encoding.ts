import { type Request } from "@fastr/core";

export class Encoding {
  static readonly identity = new Encoding("identity", "");
  static readonly gzip = new Encoding("gzip", ".gz");
  static readonly brotli = new Encoding("br", ".br");
  static readonly encodings: readonly Encoding[] = [
    Encoding.gzip,
    Encoding.brotli,
  ];

  static forPath(path: string): {
    basePath: string;
    encoding: Encoding;
  } {
    for (const encoding of Encoding.encodings) {
      const { ext } = encoding;
      if (path.endsWith(ext)) {
        return {
          basePath: path.substring(0, path.length - ext.length),
          encoding,
        };
      }
    }
    return {
      basePath: path,
      encoding: Encoding.identity,
    };
  }

  constructor(readonly name: string, readonly ext: string) {}

  isAccepted(request: Request): boolean {
    return request.acceptsEncoding(this.name);
  }
}
