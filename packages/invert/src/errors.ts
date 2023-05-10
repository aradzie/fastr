export class ContainerError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }

  get [Symbol.toStringTag](): string {
    return "ContainerError";
  }
}
