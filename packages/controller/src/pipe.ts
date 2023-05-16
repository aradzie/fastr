import { type Context } from "@fastr/core";
import { type Newable } from "@fastr/lang";
import { type RouterState } from "@fastr/middleware-router";

export interface Pipe {
  transform(ctx: Context<RouterState>, value: string): unknown;
}

export function isPipeClass(target: any): target is Newable<Pipe> {
  return typeof target?.prototype?.transform === "function";
}

export function isPipeObject(target: any): target is Pipe {
  return typeof target?.transform === "function";
}
