import { isConstructor, type Newable, reflectorOf } from "@fastr/lang";
import { kInjectable } from "./constants.js";
import { type ClassMetadata, type InjectableAnn } from "./types.js";
import { getConstructorParamsMetadata, getPropsMetadata } from "./util.js";

export function getClassMetadata(newable: Newable): ClassMetadata {
  if (!isConstructor(newable)) {
    throw new TypeError();
  }
  const ref = reflectorOf(newable);
  const injectableAnn = ref.getOwnMetadata<InjectableAnn>(kInjectable);
  const params = getConstructorParamsMetadata(ref);
  const props = getPropsMetadata(ref);
  return {
    id: injectableAnn?.id ?? null,
    name: injectableAnn?.name ?? null,
    singleton: injectableAnn?.singleton ?? false,
    newable,
    params,
    props,
  };
}
