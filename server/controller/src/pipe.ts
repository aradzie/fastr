import type { RouterContext } from "@webfx-middleware/router";
import type { Type } from "./types";

export interface IPipe {
  transform(ctx: RouterContext, value: string): any;
}

export function isPipeClass(target: any): target is Type<IPipe> {
  return typeof target?.prototype?.transform === "function";
}

export function isPipeObject(target: any): target is IPipe {
  return typeof target?.transform === "function";
}
