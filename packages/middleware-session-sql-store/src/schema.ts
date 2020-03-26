export const kId = "id" as const;
export const kData = "data" as const;
export const kUpdatedAt = "updated_at" as const;
export const kExpiresAt = "expires_at" as const;

/**
 * The columns of the table containing session data.
 */
export interface SessionTable {
  /**
   * Unique session id.
   */
  readonly [kId]: string;
  /**
   * Serialized session data.
   */
  readonly [kData]: Uint8Array;
  /**
   * Session update timestamp.
   */
  readonly [kUpdatedAt]: number | Date;
  /**
   * Session expire timestamp, if any.
   */
  readonly [kExpiresAt]: number | Date | null;
}
