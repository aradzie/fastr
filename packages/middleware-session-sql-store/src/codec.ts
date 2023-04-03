import { deserialize, serialize } from "bson";

export interface Codec {
  /**
   * Encodes session data object to binary buffer.
   */
  readonly encode: (data: Record<string, unknown>) => Uint8Array;
  /**
   * Decodes session data object from binary buffer.
   *
   * May return null if the buffer contains invalid data.
   */
  readonly decode: (data: Uint8Array) => Record<string, unknown>;
}

/**
 * The default session data codec.
 */
export const BSON_CODEC: Codec = {
  encode: (data: Record<string, unknown>): Uint8Array => {
    return serialize(data);
  },
  decode: (data: Uint8Array): Record<string, unknown> => {
    return deserialize(data);
  },
};
