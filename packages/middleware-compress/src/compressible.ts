import { MediaTypes } from "@fastr/mediatypes";

export const compressible = (type: string): boolean => {
  return MediaTypes.lookup(type)?.compressible === true;
};
