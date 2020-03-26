import { type Cookies } from "@fastr/core";
import { Adapter } from "../adapter.js";
import { type ParsedOptions } from "../options.js";
import { type Store } from "../store.js";
import { now } from "../util.js";

/**
 * The adapter which keeps all session data in external store.
 */
export class External extends Adapter<string> {
  readonly #store: Store;

  constructor(cookies: Cookies, options: ParsedOptions) {
    super(cookies, options);
    const { store } = options;
    if (store === "cookie") {
      throw new TypeError();
    }
    this.#store = store;
  }

  async load(): Promise<void> {
    const id = this.getCookie();
    if (id == null) {
      return;
    }

    const stored = await this.#store.load(id);
    if (stored == null) {
      return;
    }

    const { expires, data } = stored;
    if (expires != null && expires < now()) {
      await this.#store.destroy(id);
      return;
    }

    this.init(id, expires, data);
  }

  async commit(): Promise<void> {
    const { oldId, id, oldExpires, expires, changed } = this;
    if (id == null) {
      if (oldId != null) {
        this.setCookie(null, null);
        await this.#store.destroy(oldId);
      }
    } else {
      if (oldId != null && oldId !== id) {
        await this.#store.destroy(oldId);
      }
      if (oldId !== id || oldExpires !== expires || changed) {
        const data = Object.fromEntries(this.data);
        this.setCookie(id, expires);
        await this.#store.store(id, { expires, data });
      }
    }
  }

  protected parseCookie(val: string): string | null {
    return val.match(/^[a-zA-Z0-9]+$/) ? val : null;
  }

  protected stringifyCookie(data: string): string {
    return data;
  }
}
