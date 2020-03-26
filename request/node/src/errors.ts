export class RequestError extends Error {
  name = "RequestError";

  constructor(message: string) {
    super(message);
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor);
    }
  }

  get [Symbol.toStringTag](): string {
    return "RequestError";
  }
}

export class AbortError extends RequestError {
  readonly name = "AbortError";

  constructor(message: string) {
    super(message);
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor);
    }
  }

  get [Symbol.toStringTag](): string {
    return "AbortError";
  }
}

export class RedirectError extends RequestError {
  readonly name = "RedirectError";

  constructor(message: string) {
    super(message);
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor);
    }
  }

  get [Symbol.toStringTag](): string {
    return "RedirectError";
  }
}
