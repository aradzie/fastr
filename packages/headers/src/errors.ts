import { HttpError } from "@fastr/errors";

export class InvalidHeaderError extends HttpError {
  constructor(message: string, options?: ErrorOptions) {
    super(400, message, options);
  }

  override get [Symbol.toStringTag](): string {
    return "InvalidHeaderError";
  }
}
