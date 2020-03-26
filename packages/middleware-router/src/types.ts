import { type Context } from "@fastr/core";
import { type Router } from "./router.js";

export type ParamMiddleware = (value: string, ctx: Context) => any;

export type RouterState = {
  router: Router;
};

export type Params = Record<string, unknown>;
