import { MimeType } from "@webfx-http/headers";

export interface ErrorBody {
  readonly error: {
    readonly message: string;
    readonly [key: string]: any;
  };
}

export class ApplicationError extends Error {
  static readonly MIME_TYPE = new MimeType("application", "error+json");

  static isErrorBody(body: any): body is ErrorBody {
    if (body != null && typeof body == "object" && "error" in body) {
      const { error } = body;
      if (error != null && typeof error == "object" && "message" in error) {
        const { message } = error;
        if (typeof message == "string") {
          return true;
        }
      }
    }
    return false;
  }

  readonly status: number;
  readonly body: ErrorBody;

  constructor(
    message: string,
    {
      status = 200,
      body = {
        error: {
          message,
        },
      },
    }: {
      readonly status?: number;
      readonly body?: ErrorBody;
    } = {},
  ) {
    super(message);
    this.name = "ApplicationError";
    this.status = status;
    this.body = body;
    const fn = Error.captureStackTrace;
    if (typeof fn === "function") {
      fn(this, this.constructor);
    }
  }
}
