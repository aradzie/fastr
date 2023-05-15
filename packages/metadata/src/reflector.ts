import {
  kDesignParamTypes,
  kDesignReturnType,
  kDesignType,
} from "./impl/constants.js";
import { defineMetadata, getMetadata, hasMetadata } from "./impl/reflect.js";
import { isConstructor, type Newable } from "./newable.js";

const kPropKeys = Symbol("props");

type PropertyKey = string | symbol;
type MetadataKey = string | symbol;
type Callable = (...args: any) => any;

export type HasMetadata = {
  hasMetadata(metadataKey: MetadataKey): boolean;
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
    this.paramTypes = getMetadata(kDesignParamTypes, newable) ?? [];
    const { prototype } = newable;
    for (const [key, { value }] of Object.entries(
      Object.getOwnPropertyDescriptors(prototype),
    )) {
      if (key !== "constructor" && typeof value === "function") {
        this.methods[key] = new MethodReflector(prototype, key, value);
      }
    }
    for (const key of getMetadata(kPropKeys, prototype) ?? []) {
      this.properties[key] = new PropertyReflector(prototype, key);
    }
  }

  construct(...args: any[]): T {
    if (args.length !== this.newable.length) {
      throw new TypeError();
    }
    return Reflect.construct(this.newable, args);
  }

  hasMetadata(metadataKey: MetadataKey): boolean {
    return hasMetadata(metadataKey, this.newable);
  }

  getMetadata<T>(metadataKey: MetadataKey): T | undefined {
    return getMetadata(metadataKey, this.newable);
  }

  setMetadata(metadataKey: MetadataKey, metadataValue: unknown): void {
    defineMetadata(metadataKey, metadataValue, this.newable);
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
    this.type = getMetadata(kDesignType, prototype, key);
  }

  get(inst: object): unknown {
    return Reflect.get(inst, this.key);
  }

  set(inst: object, value: unknown): void {
    Reflect.set(inst, this.key, value);
  }

  hasMetadata(metadataKey: MetadataKey): boolean {
    return hasMetadata(metadataKey, this.prototype, this.key);
  }

  getMetadata<T>(metadataKey: MetadataKey): T | undefined {
    return getMetadata(metadataKey, this.prototype, this.key);
  }

  setMetadata(metadataKey: MetadataKey, metadataValue: unknown): void {
    defineMetadata(metadataKey, metadataValue, this.prototype, this.key);
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
    this.type = getMetadata(kDesignType, prototype, key);
    this.paramTypes = getMetadata(kDesignParamTypes, prototype, key) ?? [];
    this.returnType = getMetadata(kDesignReturnType, prototype, key);
  }

  apply(inst: object, ...args: any[]): unknown {
    if (args.length !== this.value.length) {
      throw new TypeError();
    }
    return Reflect.apply(this.value, inst, args);
  }

  hasMetadata(metadataKey: MetadataKey): boolean {
    return hasMetadata(metadataKey, this.prototype, this.key);
  }

  getMetadata<T>(metadataKey: MetadataKey): T | undefined {
    return getMetadata(metadataKey, this.prototype, this.key);
  }

  setMetadata(metadataKey: MetadataKey, metadataValue: unknown): void {
    defineMetadata(metadataKey, metadataValue, this.prototype, this.key);
  }

  get [Symbol.toStringTag](): string {
    return "MethodReflector";
  }
}

const cache = new Map<Newable<any>, Reflector>();

export const reflector = <T = unknown>(newable: Newable<T>): Reflector<T> => {
  let reflector = cache.get(newable);
  if (reflector == null) {
    cache.set(newable, (reflector = new ClassReflector<T>(newable)));
  }
  return reflector as Reflector<T>;
};

reflector.addProperty = (prototype: object, key: PropertyKey): void => {
  let propKeys = getMetadata(kPropKeys, prototype) as Set<PropertyKey>;
  if (propKeys == null) {
    defineMetadata(kPropKeys, (propKeys = new Set()), prototype);
  }
  propKeys.add(key);
};
