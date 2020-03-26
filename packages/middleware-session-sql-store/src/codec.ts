import { deserialize, serialize } from "bson";

export interface Codec {
  /**
   * Encodes session data object to binary buffer.
   */
  readonly encode: (data: Record<string, unknown>) => Buffer;
  /**
   * Decodes session data object from binary buffer.
   *
   * May return null if the buffer contains invalid data.
   */
  readonly decode: (data: Buffer) => Record<string, unknown>;
}

/**
 * The default session data codec.
 */
export const BSON_CODEC: Codec = {
  encode: (data: Record<string, unknown>): Buffer => {
    return serialize(data);
  },
  decode: (data: Buffer): Record<string, unknown> => {
    return deserialize(data);
  },
};
