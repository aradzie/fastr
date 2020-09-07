import type { Store, StoredSession } from "@webfx-middleware/session";
import { inject, injectable } from "inversify";
import type Knex from "knex";
import { BSON_CODEC, Codec } from "./codec.js";

export const kSqlStoreOptions = Symbol("kFileStoreOptions");

export interface Options {
  readonly knex: Knex;
  readonly table?: string;
  readonly codec?: Codec;
}

interface SessionTable {
  /**
   * Unique session id.
   */
  readonly id: string;
  /**
   * Serialized session data.
   */
  readonly data: Buffer;
  /**
   * Session update timestamp.
   */
  readonly updated_at: number | Date;
  /**
   * Session expire timestamp, if any.
   */
  readonly expires_at: number | Date | null;
}

@injectable()
export class SqlStore implements Store {
  private readonly knex: Knex;
  private readonly table: string;
  private readonly codec: Codec;

  constructor(@inject(kSqlStoreOptions) options: Options) {
    const { knex, table = "session", codec = BSON_CODEC } = options;
    this.knex = knex;
    this.table = table;
    this.codec = codec;
  }

  async load(sessionId: string): Promise<StoredSession | null> {
    const row = await this.newQueryBuilder().where("id", sessionId).first();
    if (row == null) {
      return null;
    }
    const { data, expires_at } = row;
    return {
      expires:
        expires_at != null ? Math.floor(Number(expires_at) / 1000) : null,
      data: this.codec.decode(data),
    };
  }

  async store(sessionId: string, session: StoredSession): Promise<void> {
    // TODO Rewrite with upsert if available in knex.
    // See https://github.com/knex/knex/issues/3186

    const { expires, data } = session;
    const row: Partial<SessionTable> = {
      data: this.codec.encode(data),
      updated_at: new Date(),
      expires_at: expires != null ? new Date(expires * 1000) : null,
    };

    // Update if existing.
    if (
      (await this.newQueryBuilder().where("id", sessionId).update(row)) === 0
    ) {
      // Insert if new.
      await this.newQueryBuilder().insert({ id: sessionId, ...row });
    }
  }

  async destroy(sessionId: string): Promise<void> {
    await this.newQueryBuilder().where("id", sessionId).delete();
  }

  async gc() {
    await this.newQueryBuilder().where("expires_at", "<", new Date()).delete();
  }

  private newQueryBuilder(): Knex.QueryBuilder<SessionTable> {
    return this.knex.table<SessionTable>(this.table);
  }

  async createSchema() {
    if (!(await this.knex.schema.hasTable(this.table))) {
      await this.knex.schema.createTable(this.table, (table) => {
        table.string("id").primary();
        table.binary("data").notNullable();
        table.timestamp("updated_at").notNullable();
        table.timestamp("expires_at").nullable();
      });
    }
  }

  async dropSchema() {
    await this.knex.schema.dropTableIfExists(this.table);
  }
}
