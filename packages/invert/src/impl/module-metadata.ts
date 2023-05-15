import { getConstructor, reflector } from "@fastr/metadata";
import { type Module } from "../types.js";
import { kProvides } from "./constants.js";
import { type ProviderMetadata, type ProvidesAnn } from "./types.js";
import { getMethodParamsMetadata, typeToValueId } from "./util.js";

export function* getProviders(module: Module): Iterable<ProviderMetadata> {
  const ref = reflector(getConstructor(module));
  for (const method of Object.values(ref.methods)) {
    const providesAnn = method.getMetadata<ProvidesAnn>(kProvides) ?? null;
    if (providesAnn != null) {
      const { value, returnType: type } = method;
      const params = getMethodParamsMetadata(ref, method);
      yield {
        type,
        id: providesAnn.id ?? typeToValueId(type),
        name: providesAnn.name ?? null,
        singleton: providesAnn.singleton ?? false,
        module,
        value,
        params,
      };
    }
  }
}
