import { isConstructor } from "@fastr/lang";
import { ContainerError } from "./errors.js";
import { makeBinder } from "./impl/binder.js";
import { ClassBinding } from "./impl/binding/class.js";
import { getClassMetadata } from "./impl/class-metadata.js";
import { Registry } from "./impl/registry.js";
import { checkValueId } from "./impl/util.js";
import {
  type Binder,
  type BindTo,
  type Module,
  type Name,
  type ReadonlyContainer,
  type ValueId,
} from "./types.js";

export type ContainerOptions = {
  readonly autoBindInjectable: boolean;
  readonly eagerSingletons: boolean;
};

export class Container implements ReadonlyContainer, Binder {
  private readonly _options: ContainerOptions;
  private readonly _registry: Registry;
  private readonly _binder: Binder;
  private _parent: Container | null;

  constructor({
    autoBindInjectable = true,
    eagerSingletons = true,
  }: Partial<ContainerOptions> = {}) {
    this._options = {
      autoBindInjectable,
      eagerSingletons,
    };
    this._registry = new Registry();
    this._binder = makeBinder(this._registry);
    this._parent = null;
    this._binder.bind(Container).toValue(this);
  }

  get parent(): Container | null {
    return this._parent;
  }

  createChild(): Container {
    const child = new Container(this._options);
    child._parent = this;
    return child;
  }

  load(module: Module): this {
    this._binder.load(module);
    return this;
  }

  bind<T>(id: ValueId<T>, name: Name | null = null): BindTo<T> {
    checkValueId(id, name);
    return this._binder.bind(id, name);
  }

  has(id: ValueId, name: Name | null = null): boolean {
    checkValueId(id, name);
    if (this._registry.has(id, name)) {
      return true;
    }
    if (this._parent != null) {
      return this._parent.has(id, name);
    }
    return false;
  }

  get<T>(id: ValueId<T>, name: Name | null = null): T {
    checkValueId(id, name);
    const binding = this._registry.get(id, name);
    if (binding != null) {
      return binding.getValue(this) as T;
    }
    if (this._parent != null && this._parent.has(id, name)) {
      return this._parent.get(id, name);
    }
    if (name == null && this._options.autoBindInjectable && isConstructor(id)) {
      const binding = new ClassBinding<T>(getClassMetadata(id));
      this._registry.set(id, name, binding);
      return binding.getValue(this);
    }
    throw new ContainerError(
      `Binding not found [${String(id)}/${String(name)}]`,
    );
  }

  get [Symbol.toStringTag](): string {
    return "Container";
  }
}
