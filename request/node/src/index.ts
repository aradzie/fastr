export type {
  Adapter,
  BuildableRequest,
  Middleware,
  HttpRequest,
  HttpResponse,
  BodyDataType,
} from "./types";
export { request } from "./instance";
export { RequestBuilder } from "./builder";
export { Streamable, FileStreamable } from "./body/streamable";
export {
  authenticate,
  compose,
  defaultOptions,
  expectType,
  followRedirects,
  handleErrors,
  retryFailed,
} from "./middleware";
export type {
  FollowRedirectOptions,
  HandleErrorOptions,
  RetryFailedOptions,
} from "./middleware";
export { RequestError } from "@webfx-request/error";
