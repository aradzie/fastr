import { type Container } from "@fastr/invert";
import { Cookies } from "./cookies.js";
import { Request } from "./request.js";
import { Response } from "./response.js";
import { type DefaultState } from "./state.js";

const kCookies = Symbol("kCookies");

export class Context<StateT = unknown> {
  private [kCookies]?: Cookies;

  constructor(
    readonly container: Container,
    readonly request: Request,
    readonly response: Response,
    readonly state: DefaultState & StateT,
  ) {
    container.bind(Context).toValue(this);
    container.bind(Request).toValue(this.request);
    container.bind(Response).toValue(this.response);
  }

  get cookies(): Cookies {
    return (this[kCookies] ??= new Cookies(
      this.request.headers,
      this.response.headers,
      {
        secure: this.request.protocol === "https",
      },
    ));
  }

  get [Symbol.toStringTag]() {
    return "Context";
  }
}
