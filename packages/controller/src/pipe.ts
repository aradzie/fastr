import { type Context } from "@fastr/core";
import { type Newable } from "@fastr/lang";

export type Pipe = (ctx: Context<any>, value: any) => any | Promise<any>;

export type PipeObject = {
  readonly parse: Pipe;
};

export type PipeClass = Newable<PipeObject> & {
  readonly prototype: PipeObject;
};

export type AnyPipe = Pipe | PipeObject | PipeClass;

export const isPipe = (target: any): target is Pipe => {
  return (
    typeof target === "function" && //
    typeof target?.parse !== "function" &&
    typeof target?.prototype?.parse !== "function"
  );
};

export const isPipeObject = (target: any): target is PipeObject => {
  return (
    typeof target !== "function" && //
    typeof target?.parse === "function"
  );
};

export const isPipeClass = (target: any): target is PipeClass => {
  return (
    typeof target === "function" && //
    typeof target?.prototype?.parse === "function"
  );
};

export const toPipe = (target: AnyPipe): Pipe => {
  if (isPipeObject(target)) {
    return (ctx, value) => target.parse(ctx, value);
  }

  if (isPipeClass(target)) {
    return (ctx, value) => ctx.container.get(target).parse(ctx, value);
  }

  if (isPipe(target)) {
    return target;
  }

  throw new TypeError(
    `Invalid pipe type ${Object.prototype.toString.call(target)}`,
  );
};
