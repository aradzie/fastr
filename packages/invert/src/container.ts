import { isConstructor } from "@fastr/lang";
import { ContainerError } from "./errors.js";
import { makeBinder } from "./impl/binder.js";
import { ClassBinding } from "./impl/binding/class.js";
import { getClassMetadata } from "./impl/class-metadata.js";
import { Registry } from "./impl/registry.js";
import { checkValueId, nameOf } from "./impl/util.js";
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
  readonly #options: ContainerOptions;
  readonly #registry: Registry;
  readonly #binder: Binder;
  #parent: Container | null;

  constructor({
    autoBindInjectable = true,
    eagerSingletons = true,
  }: Partial<ContainerOptions> = {}) {
    this.#options = {
      autoBindInjectable,
      eagerSingletons,
    };
    this.#registry = new Registry();
    this.#binder = makeBinder(this.#registry);
    this.#parent = null;
    this.#binder.bind(Container).toValue(this);
  }

  get parent(): Container | null {
    return this.#parent;
  }

  createChild(): Container {
    const child = new Container(this.#options);
    child.#parent = this;
    return child;
  }

  load(module: Module): this {
    this.#binder.load(module);
    return this;
  }

  bind<T>(id: ValueId<T>, name: Name | null = null): BindTo<T> {
    checkValueId(id, name);
    return this.#binder.bind(id, name);
  }

  has(id: ValueId, name: Name | null = null): boolean {
    checkValueId(id, name);
    if (this.#registry.has(id, name)) {
      return true;
    }
    if (this.#parent != null) {
      return this.#parent.has(id, name);
    }
    return false;
  }

  get<T>(id: ValueId<T>, name: Name | null = null): T {
    checkValueId(id, name);
    const binding = this.#registry.get(id, name);
    if (binding != null) {
      return binding.getValue(this) as T;
    }
    if (this.#parent != null && this.#parent.has(id, name)) {
      return this.#parent.get(id, name);
    }
    if (name == null && this.#options.autoBindInjectable && isConstructor(id)) {
      const binding = new ClassBinding<T>(getClassMetadata(id));
      this.#registry.set(id, name, binding);
      return binding.getValue(this);
    }
    throw new ContainerError(`Binding ${nameOf(id, name)} not found`);
  }

  get [Symbol.toStringTag](): string {
    return "Container";
  }
}
