export class RequestError extends Error {
  name = "RequestError";

  constructor(message: string) {
    super(message);
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor);
    }
  }
}

export class RequestRedirectError extends RequestError {
  readonly name = "RequestRedirectError";

  constructor(message: string) {
    super(message);
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor);
    }
  }
}

export class RequestAbortedError extends RequestError {
  name = "RequestAbortedError";

  constructor(message: string) {
    super(message);
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor);
    }
  }
}

export class RequestTimeoutError extends RequestError {
  name = "RequestTimeoutError";

  constructor(message: string) {
    super(message);
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor);
    }
  }
}

export class RequestNetworkError extends RequestError {
  name = "RequestNetworkError";

  constructor(message: string) {
    super(message);
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor);
    }
  }
}
