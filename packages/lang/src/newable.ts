export type Newable<T = any> = new (...args: any[]) => T;

export const isConstructor = <T>(target: any): target is Newable<T> => {
  return (
    typeof target === "function" && target.prototype?.constructor === target
  );
};

export const getConstructor = <T>(instance: T): Newable<T> => {
  if (instance == null || typeof instance !== "object") {
    throw new TypeError();
  }
  const { constructor } = instance;
  if (!isConstructor<T>(constructor)) {
    throw new TypeError();
  }
  return constructor;
};

export const getBaseConstructor = (newable: Newable): Newable | null => {
  if (!isConstructor(newable)) {
    throw new TypeError();
  }
  const prototype = Object.getPrototypeOf(newable);
  if (prototype != null && prototype !== Object && isConstructor(prototype)) {
    return prototype;
  }
  return null;
};
