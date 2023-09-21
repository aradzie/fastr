export const typeId = (arg: unknown): string => {
  switch (arg) {
    case undefined:
      return "<undefined>";
    case null:
      return "<null>";
  }
  switch (typeof arg) {
    case "symbol":
      return arg.description ? `<symbol ${arg.description}>` : "<symbol>";
    case "boolean":
      return `<boolean ${arg}>`;
    case "number":
      return `<number ${arg}>`;
    case "string":
      return `<string "${arg}">`;
    case "bigint":
      return `<bigint ${arg}>`;
    case "function":
      if (arg.name) {
        return `<function ${arg.name}>`;
      } else {
        return `<function>`;
      }
  }
  return Object.prototype.toString.call(arg);
};
