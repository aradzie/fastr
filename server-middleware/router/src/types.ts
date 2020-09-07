import type Koa from "koa";
import type { Router } from "./router.js";

export interface RouterParamContext<StateT = any, CustomT = {}> {
  readonly params: { [key: string]: any };
  readonly router: Router<StateT, CustomT>;
}

export type RouterContext<
  StateT = any,
  CustomT = {}
> = Koa.ParameterizedContext<
  StateT,
  CustomT & RouterParamContext<StateT, CustomT>
>;

export type RouterMiddleware<StateT = any, CustomT = {}> = Koa.Middleware<
  StateT,
  CustomT & RouterParamContext<StateT, CustomT>
>;

export interface ParamMiddleware {
  (value: string, ctx: Koa.Context): any;
}
