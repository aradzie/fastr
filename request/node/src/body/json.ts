export class Json {
  static of(value: any, replacer?: any): Json {
    return new Json(value, replacer);
  }

  static isJson(value: any): boolean {
    return value instanceof Json;
  }

  constructor(readonly data: any, readonly replacer?: any) {
    if (data == null) {
      throw new TypeError();
    }
  }

  stringify(): string {
    return JSON.stringify(this.data, this.replacer);
  }

  get [Symbol.toStringTag](): string {
    return "Json";
  }
}
