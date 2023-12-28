import {
  getMetadata,
  getOwnMetadata,
  hasMetadata,
  hasOwnMetadata,
  setMetadata,
} from "./metadata.js";
import { getBaseConstructor, isConstructor, type Newable } from "./newable.js";
import { type Callable, type MetadataKey, type PropertyKey } from "./types.js";

const kPropertyKeys = Symbol("kPropertyKeys");
const kDesignType = "design:type";
const kDesignParamTypes = "design:paramtypes";
const kDesignReturnType = "design:returntype";

export type PropertyMap = Record<PropertyKey, Property>;
export type MethodMap = Record<PropertyKey, Method>;

export type HasMetadata = {
  hasOwnMetadata(metadataKey: MetadataKey): boolean;
  hasMetadata(metadataKey: MetadataKey): boolean;
  getOwnMetadata<T = unknown>(metadataKey: MetadataKey): T | undefined;
  getMetadata<T = unknown>(metadataKey: MetadataKey): T | undefined;
  setMetadata(metadataKey: MetadataKey, metadataValue: unknown): void;
};

export type Reflector<T = any> = {
  readonly newable: Newable<T>;
  readonly paramTypes: readonly unknown[];
  readonly properties: PropertyMap;
  readonly methods: MethodMap;
  readonly allProperties: PropertyMap;
  readonly allMethods: MethodMap;
  readonly base: Reflector | null;
  construct(...args: any[]): T;
} & HasMetadata;

class ClassReflector<T = any> implements Reflector<T> {
  readonly newable: Newable<T>;
  readonly paramTypes: readonly unknown[];
  #properties: PropertyMap | null = null;
  #methods: MethodMap | null = null;
  #allProperties: PropertyMap | null = null;
  #allMethods: MethodMap | null = null;

  constructor(newable: Newable<T>) {
    if (!isConstructor(newable)) {
      throw new TypeError();
    }
    this.newable = newable;
    this.paramTypes = getOwnMetadata(kDesignParamTypes, newable) ?? [];
  }

  get properties(): PropertyMap {
    return (this.#properties ??= getProperties(this.newable));
  }

  get methods(): MethodMap {
    return (this.#methods ??= getMethods(this.newable));
  }

  get allProperties(): PropertyMap {
    return (this.#allProperties ??= getAllProperties(this));
  }

  get allMethods(): MethodMap {
    return (this.#allMethods ??= getAllMethods(this));
  }

  get base(): Reflector | null {
    const base = getBaseConstructor(this.newable);
    if (base != null) {
      return reflectorOf(base);
    } else {
      return null;
    }
  }

  construct(...args: any[]): T {
    if (args.length < this.newable.length) {
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

  constructor(
    readonly prototype: object,
    readonly key: PropertyKey,
  ) {
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
    if (args.length < this.value.length) {
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

const getProperties = ({ prototype }: Newable): PropertyMap => {
  const map = Object.create(null) as PropertyMap;
  for (const key of getOwnMetadata(kPropertyKeys, prototype) ?? []) {
    map[key] = new PropertyReflector(prototype, key);
  }
  return map;
};

const getMethods = ({ prototype }: Newable): MethodMap => {
  const map = Object.create(null) as MethodMap;
  for (const [key, { value }] of Object.entries(
    Object.getOwnPropertyDescriptors(prototype),
  )) {
    if (key !== "constructor" && typeof value === "function") {
      map[key] = new MethodReflector(prototype, key, value);
    }
  }
  return map;
};

const getAllProperties = (ref: Reflector): PropertyMap => {
  const map = Object.create(null) as PropertyMap;
  const visit = (current: Reflector) => {
    const { base } = current;
    if (base != null) {
      visit(base);
    }
    for (const value of Object.values(current.properties)) {
      map[value.key] = value;
    }
  };
  visit(ref);
  return map;
};

const getAllMethods = (ref: Reflector): MethodMap => {
  const map = Object.create(null) as MethodMap;
  const visit = (current: Reflector) => {
    const { base } = current;
    if (base != null) {
      visit(base);
    }
    for (const value of Object.values(current.methods)) {
      map[value.key] = value;
    }
  };
  visit(ref);
  return map;
};

const cache = new WeakMap<Newable, Reflector>();

export const reflectorOf = <T = any>(newable: Newable<T>): Reflector<T> => {
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
