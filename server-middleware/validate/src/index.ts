import type Joi from "@hapi/joi";
import { BadRequestError } from "@webfx-http/error";
import type Koa from "koa";

declare module "koa" {
  // TODO Remove this.
  interface Request {
    buffer: Buffer;
    text: string;
    json: any;
    form: any;
  }
}

export interface Spec {
  readonly headers?: Joi.AnySchema;
  readonly query?: Joi.AnySchema;
  readonly params?: Joi.AnySchema;
  readonly json?: Joi.AnySchema;
  readonly form?: Joi.AnySchema;

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
    schema: Joi.AnySchema,
    options?: Joi.ValidationOptions,
  ): T {
    const { error, value } = schema.validate(object, options);
    if (error != null) {
      onValidationError(ctx, error);
    }
    return value;
  }
}
