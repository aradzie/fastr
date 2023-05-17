import {
  getMetadata,
  getOwnMetadata,
  hasMetadata,
  hasOwnMetadata,
  setMetadata,
} from "./metadata.js";
import { isConstructor, type Newable } from "./newable.js";
import { type Callable, type MetadataKey, type PropertyKey } from "./types.js";

const kPropertyKeys = Symbol("kPropertyKeys");
const kDesignType = "design:type";
const kDesignParamTypes = "design:paramtypes";
const kDesignReturnType = "design:returntype";

export type HasMetadata = {
  hasOwnMetadata(metadataKey: MetadataKey): boolean;
  hasMetadata(metadataKey: MetadataKey): boolean;
  getOwnMetadata<T = unknown>(metadataKey: MetadataKey): T | undefined;
  getMetadata<T = unknown>(metadataKey: MetadataKey): T | undefined;
  setMetadata(metadataKey: MetadataKey, metadataValue: unknown): void;
};

export type Reflector<T = unknown> = {
  readonly newable: Newable<T>;
  readonly paramTypes: readonly unknown[];
  readonly properties: Record<PropertyKey, Property>;
  readonly methods: Record<PropertyKey, Method>;
  construct(...args: any[]): T;
} & HasMetadata;

class ClassReflector<T = unknown> implements Reflector<T> {
  readonly newable: Newable<T>;
  readonly paramTypes: readonly unknown[];
  readonly properties = {} as Record<PropertyKey, Property>;
  readonly methods = {} as Record<PropertyKey, Method>;

  constructor(newable: Newable<T>) {
    if (!isConstructor(newable)) {
      throw new TypeError();
    }
    this.newable = newable;
    this.paramTypes = getOwnMetadata(kDesignParamTypes, newable) ?? [];
    const { prototype } = newable;
    for (const key of getOwnMetadata(kPropertyKeys, prototype) ?? []) {
      this.properties[key] = new PropertyReflector(prototype, key);
    }
    for (const [key, { value }] of Object.entries(
      Object.getOwnPropertyDescriptors(prototype),
    )) {
      if (key !== "constructor" && typeof value === "function") {
        this.methods[key] = new MethodReflector(prototype, key, value);
      }
    }
  }

  construct(...args: any[]): T {
    if (args.length !== this.newable.length) {
      throw new TypeError();
    }
    return Reflect.construct(this.newable, args);
  }

  hasOwnMetadata(metadataKey: MetadataKey): boolean {
    return hasOwnMetadata(metadataKey, this.newable);
  }

  hasMetadata(metadataKey: MetadataKey): boolean {
    return hasMetadata(metadataKey, this.newable);
  }

  getOwnMetadata<T>(metadataKey: MetadataKey): T | undefined {
    return getOwnMetadata(metadataKey, this.newable);
  }

  getMetadata<T>(metadataKey: MetadataKey): T | undefined {
    return getMetadata(metadataKey, this.newable);
  }

  setMetadata(metadataKey: MetadataKey, metadataValue: unknown): void {
    setMetadata(metadataKey, metadataValue, this.newable);
  }

  get [Symbol.toStringTag](): string {
    return "ClassReflector";
  }
}

export type Property = {
  readonly key: PropertyKey;
  readonly type: unknown;
  get(inst: object): unknown;
  set(inst: object, value: unknown): void;
} & HasMetadata;

class PropertyReflector implements Property {
  readonly type: unknown;

  constructor(readonly prototype: object, readonly key: PropertyKey) {
    this.type = getOwnMetadata(kDesignType, prototype, key);
  }

  get(inst: object): unknown {
    return Reflect.get(inst, this.key);
  }

  set(inst: object, value: unknown): void {
    Reflect.set(inst, this.key, value);
  }

  hasOwnMetadata(metadataKey: MetadataKey): boolean {
    return hasOwnMetadata(metadataKey, this.prototype, this.key);
  }

  hasMetadata(metadataKey: MetadataKey): boolean {
    return hasMetadata(metadataKey, this.prototype, this.key);
  }

  getOwnMetadata<T>(metadataKey: MetadataKey): T | undefined {
    return getOwnMetadata(metadataKey, this.prototype, this.key);
  }

  getMetadata<T>(metadataKey: MetadataKey): T | undefined {
    return getMetadata(metadataKey, this.prototype, this.key);
  }

  setMetadata(metadataKey: MetadataKey, metadataValue: unknown): void {
    setMetadata(metadataKey, metadataValue, this.prototype, this.key);
  }

  get [Symbol.toStringTag](): string {
    return "PropertyReflector";
  }
}

export type Method = {
  readonly key: PropertyKey;
  readonly value: Callable;
  readonly type: unknown;
  readonly paramTypes: readonly unknown[];
  readonly returnType: unknown;
  apply(inst: object, ...args: any[]): unknown;
} & HasMetadata;

class MethodReflector implements Method {
  readonly type: unknown;
  readonly paramTypes: readonly unknown[];
  readonly returnType: unknown;

  constructor(
    readonly prototype: object,
    readonly key: PropertyKey,
    readonly value: Callable,
  ) {
    this.type = getOwnMetadata(kDesignType, prototype, key);
    this.paramTypes = getOwnMetadata(kDesignParamTypes, prototype, key) ?? [];
    this.returnType = getOwnMetadata(kDesignReturnType, prototype, key);
  }

  apply(inst: object, ...args: any[]): unknown {
    if (args.length !== this.value.length) {
      throw new TypeError();
    }
    return Reflect.apply(this.value, inst, args);
  }

  hasOwnMetadata(metadataKey: MetadataKey): boolean {
    return hasOwnMetadata(metadataKey, this.prototype, this.key);
  }

  hasMetadata(metadataKey: MetadataKey): boolean {
    return hasMetadata(metadataKey, this.prototype, this.key);
  }

  getOwnMetadata<T>(metadataKey: MetadataKey): T | undefined {
    return getOwnMetadata(metadataKey, this.prototype, this.key);
  }

  getMetadata<T>(metadataKey: MetadataKey): T | undefined {
    return getMetadata(metadataKey, this.prototype, this.key);
  }

  setMetadata(metadataKey: MetadataKey, metadataValue: unknown): void {
    setMetadata(metadataKey, metadataValue, this.prototype, this.key);
  }

  get [Symbol.toStringTag](): string {
    return "MethodReflector";
  }
}

const cache = new WeakMap<Newable<any>, Reflector>();

export const reflectorOf = <T = unknown>(newable: Newable<T>): Reflector<T> => {
  let reflector = cache.get(newable);
  if (reflector == null) {
    cache.set(newable, (reflector = new ClassReflector<T>(newable)));
  }
  return reflector as Reflector<T>;
};

reflectorOf.addPropertyKey = (prototype: object, key: PropertyKey): void => {
  let propertyKeys = getOwnMetadata(
    kPropertyKeys,
    prototype,
  ) as Set<PropertyKey>;
  if (propertyKeys == null) {
    setMetadata(kPropertyKeys, (propertyKeys = new Set()), prototype);
  }
  propertyKeys.add(key);
};
