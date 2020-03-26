import { type Context, type Middleware, type Next } from "@fastr/core";
import { BadRequestError } from "@fastr/errors";
import { type BodyState } from "@fastr/middleware-body";
import type Joi from "joi";

export interface Spec {
  readonly headers?: Joi.AnySchema;
  readonly query?: Joi.AnySchema;
  readonly params?: Joi.AnySchema;
  readonly json?: Joi.AnySchema;
  readonly form?: Joi.AnySchema;
  readonly onValidationError?: (
    ctx: Context,
    error: Joi.ValidationError,
  ) => never;
}

export function validate(spec: Spec): Middleware<BodyState> {
  return async (ctx: Context<BodyState>, next: Next): Promise<void> => {
    validateContext(ctx, spec);
    await next();
  };
}

export function validateContext(ctx: Context<BodyState>, spec: Spec): void {
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
    Object.assign(
      ctx.state.params,
      validateObject(ctx.state.params, spec.params),
    );
  }

  if (spec.query != null) {
    Object.assign(
      ctx.request.query,
      validateObject(ctx.request.query, spec.query),
    );
  }

  if (spec.json != null) {
    if (ctx.state.jsonBody == null) {
      throw new Error("Json body is missing");
    }
    ctx.state.jsonBody = validateObject(ctx.state.jsonBody, spec.json);
  }

  if (spec.form != null) {
    if (ctx.state.formBody == null) {
      throw new Error("Form body is missing");
    }
    ctx.state.formBody = validateObject(ctx.state.formBody, spec.form);
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
