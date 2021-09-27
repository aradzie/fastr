import { JSDOM } from "jsdom";

// Install just enough browser API, only what we actually use in tests.
install(new JSDOM(), ["Blob", "FileReader", "FormData"]);

function install(jsdom: JSDOM, what: string[]): void {
  const { window } = jsdom;
  for (const name of Object.getOwnPropertyNames(window)) {
    if (!(name in global) && what.includes(name)) {
      Object.defineProperty(global, name, {
        configurable: true,
        value: window[name],
      });
    }
  }
}
