import { type PropertyKey, reflectorOf } from "@fastr/lang";
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
) => {
  return (<T extends abstract new (...args: any) => unknown>(
    target: T,
  ): void => {
    if (Reflect.hasMetadata(kInjectable, target)) {
      throw new Error("Duplicate annotation @injectable");
    }
    Reflect.defineMetadata(
      kInjectable,
      {
        id: id ?? null,
        name: name ?? null,
        singleton: singleton ?? false,
      } satisfies InjectableAnn,
      target,
    );
  }) as ClassDecorator;
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
) => {
  if (id == null) {
    throw new TypeError();
  }
  return ((
    target: object,
    propertyKey: PropertyKey,
    parameterIndex: number,
  ): void => {
    const metadata = Reflect.getMetadata(kInject, target, propertyKey) ?? [];
    if (metadata[parameterIndex] != null) {
      throw new Error("Duplicate annotation @inject");
    }
    metadata[parameterIndex] = {
      id,
      name: name ?? null,
    } satisfies InjectAnn;
    Reflect.defineMetadata(kInject, metadata, target, propertyKey);
  }) as ParameterDecorator;
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
) => {
  return ((target: object, propertyKey: PropertyKey): void => {
    reflectorOf.addProperty(target, propertyKey);
    const { constructor } = target;
    const metadata = Reflect.getMetadata(kProp, constructor) ?? {};
    if (metadata[propertyKey] != null) {
      throw new Error("Duplicate annotation @prop");
    }
    metadata[propertyKey] = {
      propertyKey,
      id: id ?? null,
      name: name ?? null,
    } satisfies PropAnn;
    Reflect.defineMetadata(kProp, metadata, constructor);
  }) as PropertyDecorator;
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
) => {
  return ((target: object, propertyKey: PropertyKey): void => {
    if (Reflect.hasMetadata(kProvides, target, propertyKey)) {
      throw new Error("Duplicate annotation @provides");
    }
    Reflect.defineMetadata(
      kProvides,
      {
        id: id ?? null,
        name: name ?? null,
        singleton: singleton ?? false,
      } satisfies ProvidesAnn,
      target,
      propertyKey,
    );
  }) as MethodDecorator;
};
