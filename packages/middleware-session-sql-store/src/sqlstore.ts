import { inject, injectable } from "@fastr/invert";
import { type Store, type StoredSession } from "@fastr/middleware-session";
import { type Knex } from "knex";
import { BSON_CODEC, type Codec } from "./codec.js";
import {
  kData,
  kExpiresAt,
  kId,
  kUpdatedAt,
  type SessionTable,
} from "./schema.js";

export const kSqlStoreOptions = Symbol("kSqlStoreOptions");

export interface SqlStoreOptions {
  readonly knex: Knex;
  readonly table?: string;
  readonly codec?: Codec;
}

@injectable()
export class SqlStore implements Store {
  readonly #knex: Knex;
  readonly #table: string;
  readonly #codec: Codec;

  constructor(@inject(kSqlStoreOptions) options: SqlStoreOptions) {
    const { knex, table = "session", codec = BSON_CODEC } = options;
    this.#knex = knex;
    this.#table = table;
    this.#codec = codec;
  }

  async load(sessionId: string): Promise<StoredSession | null> {
    const row = await this.newQueryBuilder().where(kId, sessionId).first();
    if (row == null) {
      return null;
    }
    const { data, expires_at } = row;
    return {
      expires: expires_at != null ? Math.floor(expires_at / 1000) : null,
      data: this.#codec.decode(data),
    };
  }

  async store(sessionId: string, session: StoredSession): Promise<void> {
    const { expires, data } = session;
    await this.newQueryBuilder()
      .insert({
        id: sessionId,
        data: this.#codec.encode(data),
        updated_at: new Date(),
        expires_at: expires != null ? new Date(expires * 1000) : null,
      })
      .onConflict(kId)
      .merge();
  }

  async destroy(sessionId: string): Promise<void> {
    await this.newQueryBuilder().where(kId, sessionId).delete();
  }

  async gc(): Promise<void> {
    await this.newQueryBuilder().where(kExpiresAt, "<", new Date()).delete();
  }

  private newQueryBuilder(): Knex.QueryBuilder<SessionTable> {
    return this.#knex.table<SessionTable>(this.#table);
  }

  async createSchema(): Promise<void> {
    if (!(await this.#knex.schema.hasTable(this.#table))) {
      await this.#knex.schema.createTable(this.#table, (table) => {
        table.string(kId).primary();
        table.binary(kData).notNullable();
        table.timestamp(kUpdatedAt).notNullable();
        table.timestamp(kExpiresAt).nullable();
      });
    }
  }

  async dropSchema(): Promise<void> {
    await this.#knex.schema.dropTableIfExists(this.#table);
  }
}
