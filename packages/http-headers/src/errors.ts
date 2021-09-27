export const InvalidHeaderNameError = createError(
  "ERR_INVALID_HEADER_NAME",
  "Invalid header name.",
);

export const InvalidHeaderValueError = createError(
  "ERR_INVALID_HEADER_VALUE",
  "Invalid header value.",
);

export const InvalidCookieHeaderError = createError(
  "ERR_INVALID_COOKIE_HEADER",
  "Invalid Cookie header.",
);

export const InvalidSetCookieHeaderError = createError(
  "ERR_INVALID_SET_COOKIE_HEADER",
  "Invalid Set-Cookie header.",
);

export const InvalidMediaTypeError = createError(
  "ERR_INVALID_MEDIA_TYPE",
  "Invalid media type.",
);

export const InvalidAcceptError = createError(
  "ERR_INVALID_ACCEPT",
  "Invalid accept.",
);

export const InvalidAcceptEncodingError = createError(
  "ERR_INVALID_ACCEPT_ENCODING",
  "Invalid accept encoding.",
);

export const InvalidCacheControlHeaderError = createError(
  "ERR_CACHE_CONTROL",
  "Invalid Cache-Control header.",
);

export interface HeaderError extends Error {
  /**
   * Error code.
   */
  readonly code: string;
  /**
   * HTTP status code.
   */
  readonly status: number;
}

export interface HeaderErrorConstructor {
  new (): HeaderError;
}

/**
 * Creates a new error constructor with the given options.
 * @param code An error code.
 * @param message An error message.
 * @param status A HTTP status code.
 * @param Base The base error class.
 */
export function createError(
  code: string,
  message: string,
  status = 500,
  Base = TypeError,
): HeaderErrorConstructor {
  if (code === "") {
    throw new TypeError("Error code must not be empty.");
  }
  if (message === "") {
    throw new TypeError("Error message must not be empty.");
  }

  return class HeaderError extends Base {
    readonly code!: string;
    readonly status!: number;

    constructor() {
      super(`${code}: ${message}`);
      Object.defineProperty(this, "name", { value: `HeaderError [${code}]` });
      Object.defineProperty(this, "code", { value: code });
      Object.defineProperty(this, "status", { value: status });
    }

    get [Symbol.toStringTag](): string {
      return "HeaderError";
    }
  };
}
