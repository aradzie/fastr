import { type Adapter, type HttpRequest, type HttpResponse } from "../types.js";

export type RecorderState = "not called" | "called" | "ended" | "failed";

export class Recorder {
  private resolve!: (value?: PromiseLike<void> | void) => void;
  private reject!: (reason?: any) => void;
  /**
   * The waiter is resolved after the recorded adapter returns with a response
   * or throws an exception.
   */
  readonly waiter = new Promise<void>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });

  /**
   * Recorder state reflects whether the recorded adapter was called
   * and what is the result of the call.
   */
  state: RecorderState = "not called";
  /**
   * The last recorded request.
   */
  request: HttpRequest | null = null;
  /**
   * The last recorded response.
   */
  response: HttpResponse | null = null;
  /**
   * The last recorded error.
   */
  error: unknown | null = null;
  /**
   * The number of requests recorded.
   */
  requestCount = 0;

  record(adapter: Adapter): Adapter {
    return async (request: HttpRequest): Promise<HttpResponse> => {
      this.state = "called";
      this.request = request;
      this.response = null;
      this.error = null;
      this.requestCount += 1;
      try {
        const response = await adapter(request);
        this.state = "ended";
        this.response = response;
        setTimeout(() => {
          this.resolve();
        });
        return response;
      } catch (error) {
        this.state = "failed";
        this.error = error;
        setTimeout(() => {
          this.resolve();
        });
        throw error;
      }
    };
  }
}
