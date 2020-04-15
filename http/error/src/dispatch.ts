import { createError } from "./errors";

export function throwError(status: number, statusText?: string): never {
  throw new (createError(status))(statusText);
}
