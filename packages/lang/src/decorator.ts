const isPropertyKey = (x: any): boolean =>
  x != null && (typeof x === "string" || typeof x === "symbol");

const isObjectDescriptor = (x: any): boolean =>
  x != null && typeof x === "object";

const isParameterIndex = (x: any): boolean =>
  x != null && typeof x === "number";

export const isClassDecorator = (a?: any, b?: any, c?: any) =>
  a != null && b == null && c == null;

export const isPropertyDecorator = (a?: any, b?: any, c?: any) =>
  a != null && isPropertyKey(b) && c == null;

export const isMethodDecorator = (a?: any, b?: any, c?: any) =>
  a != null && isPropertyKey(b) && isObjectDescriptor(c);

export const isParameterDecorator = (a?: any, b?: any, c?: any) =>
  a != null && (b == null || isPropertyKey(b)) && isParameterIndex(c);

export const isClassParameterDecorator = (a?: any, b?: any, c?: any) =>
  a != null && b == null && isParameterIndex(c);

export const isMethodParameterDecorator = (a?: any, b?: any, c?: any) =>
  a != null && isPropertyKey(b) && isParameterIndex(c);
