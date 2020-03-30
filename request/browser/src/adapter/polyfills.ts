// See https://developer.mozilla.org/en-US/docs/Web/API/Blob
export function polyfillBlobApi(): void {
  // See https://developer.mozilla.org/en-US/docs/Web/API/Blob/arrayBuffer
  define(Blob.prototype, "arrayBuffer", arrayBuffer);
  // See https://developer.mozilla.org/en-US/docs/Web/API/Blob/text
  define(Blob.prototype, "text", text);
}

function define(proto: any, name: string, value: any): void {
  if (typeof proto[name] === "undefined") {
    Object.defineProperty(proto, name, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
}

function arrayBuffer(this: Blob): Promise<ArrayBuffer> {
  const reader = new FileReader();
  const promise = promisifyFileReader<ArrayBuffer>(reader);
  reader.readAsArrayBuffer(this);
  return promise;
}

function text(this: Blob): Promise<string> {
  const reader = new FileReader();
  const promise = promisifyFileReader<string>(reader);
  reader.readAsText(this);
  return promise;
}

function promisifyFileReader<T extends string | ArrayBuffer>(
  reader: FileReader,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    reader.onerror = (): void => {
      reject(reader.error);
    };
    reader.onload = (): void => {
      resolve(reader.result as T);
    };
  });
}
