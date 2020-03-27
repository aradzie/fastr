export class RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestError";
  }

  get [Symbol.toStringTag](): string {
    return "RequestError";
  }
}

export class RequestAbortedError extends RequestError {
  constructor(message: string) {
    super(message);
    this.name = "RequestAbortedError";
  }

  get [Symbol.toStringTag](): string {
    return "RequestAbortedError";
  }
}

export class RequestTimeoutError extends RequestError {
  constructor(message: string) {
    super(message);
    this.name = "RequestTimeoutError";
  }

  get [Symbol.toStringTag](): string {
    return "RequestTimeoutError";
  }
}

export class RequestNetworkError extends RequestError {
  constructor(message: string) {
    super(message);
    this.name = "RequestNetworkError";
  }

  get [Symbol.toStringTag](): string {
    return "RequestNetworkError";
  }
}
