import type { Header } from "./types.js";

/**
 * Parsed `E-Tag` header.
 */
export class ETag implements Header {
  static from(value: ETag | string): ETag {
    if (typeof value === "string") {
      return new ETag(value);
    } else {
      return value;
    }
  }

  static parse(value: string): ETag {
    return new ETag(value);
  }

  /**
   * The un-quoted ETag value.
   */
  readonly value: string;
  /**
   * Whether the ETag is weak.
   */
  readonly weak: boolean;

  constructor(value: string, weak = false) {
    if (value.startsWith("W/")) {
      weak = true;
      value = value.substring(2);
    }
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    this.value = value;
    this.weak = weak;
  }

  toString(): string {
    return `${this.weak ? "W/" : ""}"${this.value}"`;
  }

  get [Symbol.toStringTag](): string {
    return "ETag";
  }
}