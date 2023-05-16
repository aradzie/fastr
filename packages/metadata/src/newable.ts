export type Newable<T = unknown> = new (...args: any[]) => T;

export const isConstructor = <T>(target: unknown): target is Newable<T> => {
  return (
    typeof target === "function" && target.prototype?.constructor === target
  );
};

export const getConstructor = <T>(instance: T): Newable<T> => {
  if (instance == null || typeof instance !== "object") {
    throw new TypeError();
  }
  const { constructor } = instance;
  if (typeof constructor !== "function") {
    throw new TypeError();
  }
  return constructor as Newable<T>;
};
