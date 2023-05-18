declare module "mime-db" {
  export type MimeDbItemMap = {
    readonly [type: string]: MimeDbItem;
  };

  export type MimeDbItem = {
    readonly source?: string;
    readonly charset?: string;
    readonly compressible?: boolean;
    readonly extensions?: readonly string[];
  };

  const data: MimeDbItemMap;

  export default data;
}
