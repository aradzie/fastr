import { type PropertyKey } from "@fastr/metadata";

export type DefaultParams = {
  [key: PropertyKey]: unknown;
};

export type DefaultState = {
  [key: PropertyKey]: unknown;
  params: DefaultParams;
};
