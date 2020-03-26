import { multiEntriesOf, type NameValueEntries } from "@fastr/headers";
import { isSuccess, statusMessage } from "@fastr/status";
import { guessContentType } from "../body/type.js";
import {
  type Adapter,
  type BodyDataType,
  type HttpRequest,
  type HttpResponse,
} from "../types.js";

export interface FakeResponseInit {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly headers: NameValueEntries;
  readonly body: BodyDataType | null;
  readonly onBodyResolve: () => void;
}

export class FakeHttpResponse implements HttpResponse {
  static of(
    body: BodyDataType,
    init: Partial<Omit<FakeResponseInit, "body">> = {},
  ): Adapter {
    return async ({ url }: HttpRequest): Promise<HttpResponse> => {
      return new FakeHttpResponse({ url, ...init, body });
    };
  }

  static from(init: Partial<FakeResponseInit> = {}): Adapter {
    return async ({ url }: HttpRequest): Promise<HttpResponse> => {
      return new FakeHttpResponse({ url, ...init });
    };
  }

  static redirect(status: number, location: string): Adapter {
    return async ({ url }: HttpRequest): Promise<HttpResponse> => {
      return new FakeHttpResponse({
        url,
        status,
        headers: { location },
        body: `See [${location}]`,
      });
    };
  }

  static notFound(init: Partial<FakeResponseInit> = {}): Adapter {
    return async ({ url }: HttpRequest): Promise<HttpResponse> => {
      return new FakeHttpResponse({
        url,
        status: 404,
        body: `Not Found [${url}]`,
        ...init,
      });
    };
  }

  /**
   * Returns an adapter which, when called, will throw the given error.
   * @param error An error to throw.
   */
  static throwError(error: Error): Adapter {
    return async (): Promise<HttpResponse> => {
      throw error;
    };
  }

  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly body: Promise<Blob>;
  readonly onBodyResolve: () => void;
  #aborted = false;
  #bodyUsed = false;

  constructor(init: Partial<FakeResponseInit>) {
    const headers = new Headers([...multiEntriesOf(init.headers ?? [])]);
    const body = toBlob(
      ...guessContentType(init.body ?? null, headers.get("Content-Type")),
    );
    if (body.type && !headers.has("Content-Type")) {
      headers.set("Content-Type", body.type);
    }
    if (body.size && !headers.has("Content-Length")) {
      headers.set("Content-Length", String(body.size));
    }
    const {
      url = "http://fake/",
      status = 200,
      statusText = statusMessage(status),
      onBodyResolve = () => {},
    } = init;
    this.url = url;
    this.ok = isSuccess(status);
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
    this.body = Promise.resolve(body);
    this.onBodyResolve = onBodyResolve;
  }

  #readBlob(): Promise<Blob> {
    if (this.#aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }
    if (this.#bodyUsed) {
      throw new TypeError("Body has already been consumed.");
    }
    return this.body;
  }

  async blob(): Promise<Blob> {
    const result = await this.#readBlob();
    return resolveBody(result, this.onBodyResolve);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const result = (await this.#readBlob()).arrayBuffer();
    return resolveBody(result, this.onBodyResolve);
  }

  async text(): Promise<string> {
    const result = (await this.#readBlob()).text();
    return resolveBody(result, this.onBodyResolve);
  }

  async formData(): Promise<FormData> {
    throw new DOMException("NOT_SUPPORTED_ERR", "NotSupportedError");
  }

  async json<T = unknown>(): Promise<T> {
    const result = JSON.parse(await (await this.#readBlob()).text());
    return resolveBody(result, this.onBodyResolve);
  }

  abort(): void {
    this.#aborted = true;
  }

  get bodyUsed(): boolean {
    return this.#bodyUsed;
  }

  get [Symbol.toStringTag](): string {
    return "FakeHttpResponse";
  }
}

function toBlob(body: BodyInit | null, contentType: string | null): Blob {
  if (body == null) {
    return new Blob([], {});
  }

  if (typeof body === "string") {
    return new Blob([body], {
      type: contentType ?? "text/plain",
    });
  }

  if (body instanceof Blob) {
    return new Blob([body], {
      type: contentType ?? (body.type || "application/octet-stream"),
    });
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return new Blob([body], {
      type: contentType ?? "application/octet-stream",
    });
  }

  if (body instanceof FormData) {
    throw new TypeError("FormData body is not supported");
  }

  if (body instanceof URLSearchParams) {
    return new Blob([String(body)], {
      type: contentType ?? "application/x-www-form-urlencoded",
    });
  }

  throw new TypeError(
    `Invalid body type ${Object.prototype.toString.call(body)}`,
  );
}

function resolveBody<T>(result: T, callback: () => void): T {
  setTimeout(callback);
  return result;
}
