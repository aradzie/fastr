import { type DatabaseSync } from "node:sqlite";
import { inject, injectable } from "@fastr/invert";
import { type Store, type StoredSession } from "@fastr/middleware-session";
import { BSON_CODEC, type Codec } from "./codec.js";
import { kData, kExpiresAt, kId, kUpdatedAt } from "./schema.js";

export const kSqlStoreOptions = Symbol("kSqlStoreOptions");

export interface SqlStoreOptions {
  readonly database: DatabaseSync;
  readonly table?: string;
  readonly codec?: Codec;
}

const kValidTableName = /^[A-Za-z_][A-Za-z0-9_]*$/;

@injectable()
export class SqlStore implements Store {
  readonly #database: DatabaseSync;
  readonly #table: string;
  readonly #codec: Codec;

  constructor(@inject(kSqlStoreOptions) options: SqlStoreOptions) {
    const { database, table = "session", codec = BSON_CODEC } = options;
    if (!kValidTableName.test(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }
    this.#database = database;
    this.#table = table;
    this.#codec = codec;
  }

  async load(sessionId: string): Promise<StoredSession | null> {
    const row = this.#database
      .prepare(
        `SELECT "${kData}", "${kExpiresAt}" FROM "${this.#table}" WHERE "${kId}" = ?`,
      )
      .get(sessionId) as { [kData]: Uint8Array; [kExpiresAt]: number | null } | undefined;
    if (row == null) {
      return null;
    }
    const { [kData]: data, [kExpiresAt]: expiresAt } = row;
    return {
      expires: expiresAt != null ? Math.floor(expiresAt / 1000) : null,
      data: this.#codec.decode(data),
    };
  }

  async store(sessionId: string, session: StoredSession): Promise<void> {
    const { expires, data } = session;
    this.#database
      .prepare(
        `INSERT INTO "${this.#table}" ("${kId}", "${kData}", "${kUpdatedAt}", "${kExpiresAt}")
         VALUES (?, ?, ?, ?)
         ON CONFLICT("${kId}") DO UPDATE SET
           "${kData}" = excluded."${kData}",
           "${kUpdatedAt}" = excluded."${kUpdatedAt}",
           "${kExpiresAt}" = excluded."${kExpiresAt}"`,
      )
      .run(
        sessionId,
        this.#codec.encode(data),
        Date.now(),
        expires != null ? expires * 1000 : null,
      );
  }

  async destroy(sessionId: string): Promise<void> {
    this.#database
      .prepare(`DELETE FROM "${this.#table}" WHERE "${kId}" = ?`)
      .run(sessionId);
  }

  async gc(): Promise<void> {
    this.#database
      .prepare(`DELETE FROM "${this.#table}" WHERE "${kExpiresAt}" < ?`)
      .run(Date.now());
  }

  async createSchema(): Promise<void> {
    this.#database.exec(
      `CREATE TABLE IF NOT EXISTS "${this.#table}" (
         "${kId}" TEXT PRIMARY KEY,
         "${kData}" BLOB NOT NULL,
         "${kUpdatedAt}" INTEGER NOT NULL,
         "${kExpiresAt}" INTEGER
       )`,
    );
  }

  async dropSchema(): Promise<void> {
    this.#database.exec(`DROP TABLE IF EXISTS "${this.#table}"`);
  }
}
