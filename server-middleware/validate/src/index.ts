import { BadRequestError } from "@webfx-http/error";
import Joi from "joi";
import Koa from "koa";

export interface Spec {
  readonly headers?: Joi.SchemaLike;
  readonly query?: Joi.SchemaLike;
  readonly params?: Joi.SchemaLike;
  readonly json?: Joi.SchemaLike;
  readonly form?: Joi.SchemaLike;

  onValidationError?(
    ctx: Koa.ParameterizedContext,
    error: Joi.ValidationError,
  ): never;
}

export function validate(spec: Spec): Koa.Middleware {
  return async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
    validateContext(ctx, spec);
    return next();
  };
}

export function validateContext(ctx: Koa.ParameterizedContext, spec: Spec) {
  const {
    onValidationError = () => {
      throw new BadRequestError();
    },
  } = spec;
  if (spec.headers != null) {
    Object.assign(
      ctx.request.headers,
      validateObject(ctx.request.headers, spec.headers, { allowUnknown: true }),
    );
  }
  if (spec.params != null) {
    Object.assign(ctx.params, validateObject(ctx.params, spec.params));
  }
  if (spec.query != null) {
    Object.assign(
      ctx.request.query,
      validateObject(ctx.request.query, spec.query),
    );
  }

  if (spec.json != null) {
    if (ctx.request.json == null) {
      throw new Error();
    }
    ctx.request.json = validateObject(ctx.request.json, spec.json);
  }
  if (spec.form != null) {
    if (ctx.request.form == null) {
      throw new Error();
    }
    ctx.request.form = validateObject(ctx.request.form, spec.form);
  }

  function validateObject<T>(
    object: T,
    schema: Joi.SchemaLike,
    options?: Joi.ValidationOptions,
  ): T {
    const { error, value } = Joi.validate(object, schema, options);
    if (error) {
      onValidationError(ctx, error);
    }
    return value;
  }
}
