import { type Name, type ValueId } from "../types.js";
import { type Binding } from "./binding/types.js";

type BindingMap = Map<ValueId, Binding>;

export class Registry implements Iterable<[ValueId, Name | null, Binding]> {
  private readonly _unnamed: BindingMap = new Map();
  private readonly _named: Map<Name, BindingMap> = new Map();

  *[Symbol.iterator](): Iterator<[ValueId, Name | null, Binding]> {
    for (const [id, binding] of this._unnamed) {
      yield [id, null, binding];
    }
    for (const [name, map] of this._named) {
      for (const [id, binding] of map) {
        yield [id, name, binding];
      }
    }
  }

  *bindings(): Iterable<Binding> {
    for (const binding of this._unnamed.values()) {
      yield binding;
    }
    for (const map of this._named.values()) {
      for (const binding of map.values()) {
        yield binding;
      }
    }
  }

  has(id: ValueId, name: Name | null): boolean {
    const map = name == null ? this._unnamed : this._named.get(name);
    if (map == null) {
      return false;
    }
    return map.has(id);
  }

  get(id: ValueId, name: Name | null): Binding | null {
    const map = name == null ? this._unnamed : this._named.get(name);
    if (map == null) {
      return null;
    }
    return map.get(id) ?? null;
  }

  set(id: ValueId, name: Name | null, binding: Binding): void {
    let map = name == null ? this._unnamed : this._named.get(name);
    if (map == null) {
      this._named.set(name!, (map = new Map()));
    }
    map.set(id, binding);
  }

  addAll(that: Registry): void {
    for (const [id, name, binding] of that) {
      this.set(id, name, binding);
    }
  }

  delete(id: ValueId, name: Name | null): void {
    const map = name == null ? this._unnamed : this._named.get(name);
    if (map != null) {
      map.delete(id);
    }
  }

  clear(): void {
    this._unnamed.clear();
    this._named.clear();
  }

  get [Symbol.toStringTag](): string {
    return "Registry";
  }
}
