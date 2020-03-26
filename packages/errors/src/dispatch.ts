import { createError } from "./errors.js";

export function throwError(
  status: number,
  statusText?: string,
  options?: ErrorOptions,
): never {
  throw new (createError(status))(statusText, options);
}
