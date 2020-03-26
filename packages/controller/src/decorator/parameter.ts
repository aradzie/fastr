import {
  getCookieParam,
  getHeaderParam,
  getPathParam,
  getQueryParam,
} from "../impl/context.js";
import { makeParameterDecorator } from "../impl/parameter.js";
import { type AnyPipe } from "../pipe.js";

export const pathParam = (
  key: string,
  pipe: AnyPipe | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getPathParam, key, pipe);
};

export const queryParam = (
  key: string,
  pipe: AnyPipe | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getQueryParam, key, pipe);
};

export const headerParam = (
  key: string,
  pipe: AnyPipe | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getHeaderParam, key.toLowerCase(), pipe);
};

export const cookieParam = (
  key: string,
  pipe: AnyPipe | null = null,
): ParameterDecorator => {
  return makeParameterDecorator(getCookieParam, key, pipe);
};
