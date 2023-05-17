import {
  getOwnMetadata,
  hasOwnMetadata,
  type PropertyKey,
  reflectorOf,
  setMetadata,
} from "@fastr/lang";
import { kInject, kInjectable, kProp, kProvides } from "./impl/constants.js";
import {
  type InjectableAnn,
  type InjectAnn,
  type PropAnn,
  type ProvidesAnn,
} from "./impl/types.js";
import { type Name, type ValueId } from "./types.js";

/**
 * Injectable annotation options.
 */
export type InjectableOptions = {
  readonly id: ValueId;
  readonly name: Name;
  readonly singleton: boolean;
};

/**
 * Annotates a class as an injectable.
 *
 * @example
 * ```
 * @injectable()
 * class MyService { ... }
 * ```
 *
 * @example
 * ```
 * @injectable({ singleton: true })
 * class MyService { ... }
 * ```
 */
export const injectable = (
  { id, name, singleton }: Partial<InjectableOptions> = {}, //
): ClassDecorator => {
  return (target: object): void => {
    if (hasOwnMetadata(kInjectable, target)) {
      throw new Error("Duplicate annotation @injectable");
    }
    setMetadata(
      kInjectable,
      {
        id: id ?? null,
        name: name ?? null,
        singleton: singleton ?? false,
      } satisfies InjectableAnn,
      target,
    );
  };
};

/**
 * Inject annotation options.
 */
export type InjectOptions = {
  readonly name: Name;
};

/**
 * Annotates a constructor or method parameter with additional metadata about an
 * injected dependency.
 *
 * @example
 * ```
 * @injectable()
 * class MyService {
 *   constructor(@inject("url") url: string) { ... }
 * }
 * ```
 *
 * @example
 * ```
 * class MyModule implements Module {
 *   @provides({ id: "url" }})
 *   provideUrl(@inject("base") base: string): string {
 *     ...
 *   }
 * }
 * ```
 */
export const inject = <T = unknown>(
  id: ValueId<T>,
  { name }: Partial<InjectOptions> = {}, //
): ParameterDecorator => {
  if (id == null) {
    throw new TypeError();
  }
  return (
    target: object,
    propertyKey: PropertyKey | undefined,
    parameterIndex: number,
  ): void => {
    const metadata = getOwnMetadata(kInject, target, propertyKey) ?? [];
    if (metadata[parameterIndex] != null) {
      throw new Error("Duplicate annotation @inject");
    }
    metadata[parameterIndex] = {
      id,
      name: name ?? null,
    } satisfies InjectAnn;
    setMetadata(kInject, metadata, target, propertyKey);
  };
};

/**
 * Property annotation options.
 */
export type PropOptions = {
  readonly id: ValueId;
  readonly name: Name;
};

export const prop = <T = unknown>(
  { id, name }: Partial<PropOptions> = {}, //
): PropertyDecorator => {
  return (target: object, propertyKey: PropertyKey): void => {
    reflectorOf.addPropertyKey(target, propertyKey);
    const { constructor } = target;
    const metadata = getOwnMetadata(kProp, constructor) ?? {};
    if (metadata[propertyKey] != null) {
      throw new Error("Duplicate annotation @prop");
    }
    metadata[propertyKey] = {
      propertyKey,
      id: id ?? null,
      name: name ?? null,
    } satisfies PropAnn;
    setMetadata(kProp, metadata, constructor);
  };
};

/**
 * Provider function options.
 */
export type ProvidesOptions = {
  readonly id: ValueId;
  readonly name: Name;
  readonly singleton: boolean;
};

/**
 * Annotates a module method which is a provider of a value.
 *
 * @example
 * ```
 * class MyModule implements Module {
 *   @provide()
 *   provideSum(@inject("a") a: number, @inject("b") b: number): number {
 *     return a + b;
 *   }
 * }
 * ```
 */
export const provides = (
  { id, name, singleton }: Partial<ProvidesOptions> = {}, //
): MethodDecorator => {
  return (target: object, propertyKey: PropertyKey): void => {
    if (hasOwnMetadata(kProvides, target, propertyKey)) {
      throw new Error("Duplicate annotation @provides");
    }
    setMetadata(
      kProvides,
      {
        id: id ?? null,
        name: name ?? null,
        singleton: singleton ?? false,
      } satisfies ProvidesAnn,
      target,
      propertyKey,
    );
  };
};
