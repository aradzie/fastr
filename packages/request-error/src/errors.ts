export class RequestError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "RequestError";
    this.code = code;
  }

  get [Symbol.toStringTag](): string {
    return "RequestError";
  }
}
