import Cookies from "cookies";
import { Adapter } from "../adapter";
import { ParsedOptions } from "../options";
import { Store } from "../store";
import { now } from "../util";

/**
 * The adapter which keeps all session data in external store.
 */
export class External extends Adapter<string> {
  private readonly store: Store;

  constructor(cookies: Cookies, options: ParsedOptions) {
    super(cookies, options);
    const { store } = options;
    if (store == "cookie") {
      throw new TypeError();
    }
    this.store = store;
  }

  async load() {
    const id = this.getCookie();
    if (id == null) {
      return;
    }

    const stored = await this.store.load(id);
    if (stored == null) {
      return;
    }

    const { expires, data } = stored;
    if (expires != null && expires < now()) {
      await this.store.destroy(id);
      return;
    }

    this.init(id, expires, data);
  }

  async commit() {
    const { oldId, id, oldExpires, expires, changed } = this;
    if (id == null) {
      if (oldId != null) {
        this.setCookie(null, null);
        await this.store.destroy(oldId);
      }
    } else {
      if (oldId != null && oldId != id) {
        await this.store.destroy(oldId);
      }
      if (oldId != id || oldExpires != expires || changed) {
        const data = Object.fromEntries(this.data);
        this.setCookie(id, expires);
        await this.store.store(id, { expires, data });
      }
    }
  }

  protected parseCookie(val: string) {
    return val.match(/^[a-zA-Z0-9]+$/) ? val : null;
  }

  protected stringifyCookie(data: string) {
    return data;
  }
}
