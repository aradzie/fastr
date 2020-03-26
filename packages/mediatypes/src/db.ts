import json from "mime-db/db.json";

export type MimeDbItem = {
  readonly source?: string;
  readonly charset?: string;
  readonly compressible?: boolean;
  readonly extensions?: readonly string[];
};

export type MimeDbItemMap = {
  readonly [type: string]: MimeDbItem;
};

export const data = json as MimeDbItemMap;
