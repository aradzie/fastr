import { isConstructor, type Newable, typeId } from "@fastr/lang";
import {
  type Binder,
  type BindTo,
  type Module,
  type Name,
  type ValueId,
} from "../types.js";
import { ClassBinding } from "./binding/class.js";
import { ProviderBinding } from "./binding/provider.js";
import { ValueBinding } from "./binding/value.js";
import { getClassMetadata } from "./class-metadata.js";
import { getProviders } from "./module-metadata.js";
import { type Registry } from "./registry.js";
import { checkValueId, nameOf } from "./util.js";

export function makeBinder(reg: Registry): Binder {
  const binder: Binder = {
    bind: <T>(id: ValueId<T>, name: Name | null = null): BindTo<T> => {
      checkValueId(id, name);
      const bindTo: BindTo<T> = {
        toSelf: (): void => {
          if (!isConstructor(id)) {
            throw new TypeError(
              `Cannot bind ${nameOf(id, name)} ` +
                `to itself because it is not a constructor`,
            );
          }
          reg.set(id, name, new ClassBinding(getClassMetadata(id)));
        },
        to: (constructor: Newable<T>): void => {
          if (!isConstructor(constructor)) {
            throw new TypeError(
              `Cannot bind ${nameOf(id, name)} ` +
                `to ${typeId(constructor)} because it is not a constructor`,
            );
          }
          reg.set(id, name, new ClassBinding(getClassMetadata(constructor)));
        },
        toValue: (value: T): void => {
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
