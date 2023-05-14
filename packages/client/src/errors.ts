export class RequestError extends Error {
  readonly code!: string;

  constructor(message: string, code: string) {
    super(message);
    Object.defineProperty(this, "name", {
      value: "RequestError",
    });
    Object.defineProperty(this, "code", {
      value: code,
    });
  }

  get [Symbol.toStringTag](): string {
    return "RequestError";
  }
}
