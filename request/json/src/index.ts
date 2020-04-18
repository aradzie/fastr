/**
 * Checks at runtime that the given body argument is a proper JSON body.
 * It accepts either plain objects or objects with the `toJSON` method.
 * Anything else, e.g. non-plain objects, arrays, functions, primitives, etc.
 * are rejected.
 */
export function isJSON(value: any): boolean {
  return (
    isObject(value) &&
    (isPlainObject(value) ||
      ("toJSON" in value && typeof value.toJSON === "function"))
  );
}

function isObject(value: any): boolean {
  return value != null && typeof value === "object";
}

function isPlainObject(value: any): boolean {
  if (Object.prototype.toString.call(value) === "[object Object]") {
    const prototype = Object.getPrototypeOf(value);
    return prototype == null || prototype === Object.prototype;
  } else {
    return false;
  }
}
