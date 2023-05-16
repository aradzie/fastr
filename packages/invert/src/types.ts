import { type Newable } from "@fastr/lang";

export type Name = string | symbol;

export type Abstract<T> = {
  prototype: T;
};

export type ValueId<T = unknown> = Name | Newable<T> | Abstract<T>;

export type Module = {
  configure(binder: Binder): void;
};

export type Binder = {
  load(module: Module): Binder;
  bind<T>(id: ValueId<T>, name?: Name | null): BindTo<T>;
};

export type BindTo<T> = {
  toSelf(): void;
  to(constructor: Newable<T> | Abstract<T>): void;
  toFactory(factory: (container: ReadonlyContainer) => T): void;
  toValue(value: T): void;
};

export type ReadonlyContainer = {
  has(id: ValueId, name?: Name | null): boolean;
  get<T>(id: ValueId<T>, name?: Name | null): T;
};

export type MethodHandle<T> = {
  apply(factory: ReadonlyContainer): T;
};
