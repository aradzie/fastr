import {
  isConstructor,
  kDesignParamTypes,
  kDesignType,
  type Newable,
} from "@fastr/metadata";
import { kInject, kInjectable, kProp } from "./constants.js";
import {
  type ClassMetadata,
  type InjectableAnn,
  type InjectAnn,
  type ParamMetadata,
  type PropAnn,
  type PropMetadata,
} from "./types.js";
import { mergeParams } from "./util.js";

export function getClassMetadata(newable: Newable<any>): ClassMetadata {
  if (!isConstructor(newable)) {
    throw new TypeError();
  }
  const { prototype } = newable;
  const { id, name, singleton } = getInjectableAnn(newable);
  const props = getProps();
  const params = getParams();
  return { id, name, singleton, props, newable, params };

  function getProps(): PropMetadata[] {
    const propAnn = getPropAnn(newable);
    const props = new Array<PropMetadata>();
    for (const { propertyKey, id, name } of propAnn) {
      const type = Reflect.getMetadata(kDesignType, prototype, propertyKey);
      if (type == null) {
        throw new Error(`Design types are missing on ${newable.name}`);
      }
      props.push({ propertyKey, type, id: id ?? type, name });
    }
    return props;
  }

  function getParams<T>(): ParamMetadata[] {
    const paramTypes = Reflect.getMetadata(kDesignParamTypes, newable) ?? [];
    if (newable.length !== paramTypes.length) {
      throw new Error(`Design types are missing on ${newable.name}`);
    }
    const injectAnn = getInjectAnn(newable);
    return mergeParams(newable, paramTypes, injectAnn);
  }
}

function getInjectableAnn(target: object): InjectableAnn {
  return (
    Reflect.getMetadata(kInjectable, target) ??
    ({
      id: null,
      name: null,
      singleton: false,
    } satisfies InjectableAnn)
  );
}

function getPropAnn(target: object): readonly PropAnn[] {
  return Object.values(Reflect.getMetadata(kProp, target) ?? {});
}

function getInjectAnn(target: object): readonly InjectAnn[] {
  return Reflect.getMetadata(kInject, target) ?? [];
}
