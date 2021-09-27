import { deserialize, serialize } from "bson";

export interface Codec {
  /**
   * Encodes session data object to binary buffer.
   */
  readonly encode: (data: any) => Buffer;
  /**
   * Decodes session data object from binary buffer.
   *
   * May return null if the buffer contains invalid data.
   */
  readonly decode: (data: Buffer) => any;
}

/**
 * The default session data codec.
 */
export const BSON_CODEC: Codec = {
  encode: (data: any): Buffer => {
    return serialize(data);
  },
  decode: (data: Buffer): any => {
    return deserialize(data);
  },
};
