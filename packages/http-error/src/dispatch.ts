import { createError } from "./errors.js";

export function throwError(status: number, statusText?: string): never {
  throw new (createError(status))(statusText);
}
