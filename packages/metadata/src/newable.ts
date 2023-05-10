export type Newable<T> = new (...args: any[]) => T;

export const isConstructor = <T>(target: unknown): target is Newable<T> =>
  typeof target === "function" && target.prototype?.constructor === target;

export const getConstructor = <T>(instance: T): Newable<T> => {
  if (instance == null || typeof instance !== "object") {
    throw new TypeError("Not an object");
  }
  const { constructor } = instance;
  if (typeof constructor !== "function") {
    throw new TypeError("Not an instance");
  }
  return constructor as Newable<T>;
};
