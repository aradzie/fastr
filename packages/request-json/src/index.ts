/**
 * Checks at runtime that the given body argument is a proper JSON body.
 * It accepts either plain objects, arrays or objects with the `toJSON` method.
 * Anything else, e.g. non-plain objects such as Map, functions, primitives,
 * etc. are rejected.
 */
export function isJSON(value: any): boolean {
  // prettier-ignore
  return (
    // Is this any object?
    value != null && typeof value === "object" &&
    (
      // Is this a plain object?
      isPlainObject(value) ||
      // Is this an array?
      Array.isArray(value) ||
      // Has function toJSON?
      typeof value.toJSON === "function"
    )
  );
}

function isPlainObject(value: any): boolean {
  if (Object.prototype.toString.call(value) === "[object Object]") {
    const prototype = Object.getPrototypeOf(value);
    return prototype == null || prototype === Object.prototype;
  } else {
    return false;
  }
}
