/*
 * See https://tools.ietf.org/html/rfc7807
 */

export type ErrorBody = {
  readonly error: {
    readonly message: string;
    readonly [key: string]: unknown;
  };
};

export type ApplicationErrorOptions = ErrorOptions & {
  readonly status?: number;
  readonly body?: ErrorBody;
};

export class ApplicationError extends Error {
  static readonly MIME_TYPE = "application/error+json";

  static isErrorBody(body: unknown): body is ErrorBody {
    if (body != null && typeof body === "object" && "error" in body) {
      const { error } = body;
      if (error != null && typeof error === "object" && "message" in error) {
        const { message } = error;
        if (typeof message === "string") {
          return true;
        }
      }
    }
    return false;
  }

  static fromErrorBody(
    body: unknown,
    options?: Omit<ApplicationErrorOptions, "body">,
  ): ApplicationError | null {
    if (this.isErrorBody(body)) {
      return new ApplicationError(body.error.message, { ...options, body });
    } else {
      return null;
    }
  }

  declare readonly status: number;
  declare readonly body: ErrorBody;

  constructor(message: string, options?: ApplicationErrorOptions) {
    super(message, options);
    const status = options?.status ?? 200;
    const body = options?.body ?? { error: { message } };
    Object.defineProperty(this, "name", {
      value: `ApplicationError`,
    });
    Object.defineProperty(this, "status", {
      value: status,
    });
    Object.defineProperty(this, "body", {
      value: body,
    });
  }

  toJSON() {
    return this.body;
  }

  get [Symbol.toStringTag]() {
    return "ApplicationError";
  }
}
