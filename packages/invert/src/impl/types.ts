import { type Newable } from "@fastr/metadata";
import { type Name, type ValueId } from "../types.js";

export type PropertyKey = string | symbol;
export type MetadataKey = string | symbol;
export type Callable = (...args: any) => any;

export type InjectableAnn = {
  readonly id: ValueId | null;
  readonly name: Name | null;
  readonly singleton: boolean;
};

export type InjectAnn = {
  readonly id: ValueId;
  readonly name: Name | null;
};

export type PropAnn = {
  readonly propertyKey: PropertyKey;
  readonly id: ValueId | null;
  readonly name: Name | null;
};

export type PropAnnRecord = Record<PropertyKey, PropAnn>;

export type ProvidesAnn = {
  readonly id: ValueId | null;
  readonly name: Name | null;
  readonly singleton: boolean;
};

export type ClassMetadata = {
  readonly id: ValueId | null;
  readonly name: Name | null;
  readonly singleton: boolean;
  readonly newable: Newable<any>;
  readonly params: readonly ParamMetadata[];
  readonly props: readonly PropMetadata[];
};

export type PropMetadata = {
  readonly propertyKey: PropertyKey;
  readonly type: unknown;
  readonly id: ValueId;
  readonly name: Name | null;
};

export type ProviderMetadata = {
  readonly type: unknown;
  readonly id: ValueId;
  readonly name: Name | null;
  readonly singleton: boolean;
  readonly module: object;
  readonly value: Callable;
  readonly params: readonly ParamMetadata[];
};

export type ParamMetadata = {
  readonly index: number;
  readonly type: unknown;
  readonly id: ValueId;
  readonly name: Name | null;
};
