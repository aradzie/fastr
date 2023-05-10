import { isConstructor, type Newable } from "@fastr/metadata";
import {
  type Binder,
  type BindTo,
  type Module,
  type Name,
  type ReadonlyContainer,
  type ValueId,
} from "../types.js";
import { ClassBinding } from "./binding/class.js";
import { FactoryBinding } from "./binding/factory.js";
import { ProviderBinding } from "./binding/provider.js";
import { ValueBinding } from "./binding/value.js";
import { getClassMetadata } from "./class-metadata.js";
import { getProviders } from "./module-metadata.js";
import { type Registry } from "./registry.js";

export function makeBinder(reg: Registry): Binder {
  const binder: Binder = {
    bind: <T>(id: ValueId<T>, name: Name | null = null): BindTo<T> => {
      const bindTo: BindTo<T> = {
        toSelf: (): void => {
          if (!isConstructor(id)) {
            throw new TypeError();
          }
          reg.set(id, name, new ClassBinding(getClassMetadata(id)));
        },
        to: <T>(constructor: Newable<T>): void => {
          if (!isConstructor(constructor)) {
            throw new TypeError();
          }
          reg.set(id, name, new ClassBinding(getClassMetadata(constructor)));
        },
        toFactory(factory: (container: ReadonlyContainer) => T): void {
          reg.set(id, name, new FactoryBinding(factory));
        },
        toValue: <T>(value: T): void => {
          reg.set(id, name, new ValueBinding(value));
        },
      };
      return bindTo;
    },
    load: (module: Module): Binder => {
      module.configure(binder);
      for (const provider of getProviders(module)) {
        reg.set(provider.id, provider.name, new ProviderBinding(provider));
      }
      return binder;
    },
  };
  return binder;
}
