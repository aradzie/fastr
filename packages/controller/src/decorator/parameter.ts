import { type Newable } from "@fastr/metadata";
import {
  getBody,
  getCookieParam,
  getFormParam,
  getHeaderParam,
  getPathParam,
  getQueryParam,
} from "../impl/context.js";
import { makeParameterDecorator } from "../impl/parameter.js";
import { type Pipe } from "../pipe.js";

export const body = (): ParameterDecorator => {
  return makeParameterDecorator(getBody, null, null);
};

export const pathParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getPathParam, key, pipe);
};

export const queryParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getQueryParam, key, pipe);
};

export const headerParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getHeaderParam, key.toLowerCase(), pipe);
};

export const cookieParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getCookieParam, key, pipe);
};

export const formParam = (
  key: string,
  pipe: Newable<Pipe> | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getFormParam, key, pipe);
};
