import { isConstructor, type Newable, reflector } from "@fastr/metadata";
import { kInjectable } from "./constants.js";
import { type ClassMetadata, type InjectableAnn } from "./types.js";
import { getConstructorParamsMetadata, getPropsMetadata } from "./util.js";

export function getClassMetadata(newable: Newable<any>): ClassMetadata {
  if (!isConstructor(newable)) {
    throw new TypeError();
  }
  const ref = reflector(newable);
  const injectableAnn = ref.getMetadata<InjectableAnn>(kInjectable);
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
