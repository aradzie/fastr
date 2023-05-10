export function* ownMethods(
  prototype: unknown,
): Iterable<[propertyKey: string, descriptor: PropertyDescriptor]> {
  for (const [propertyKey, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(prototype),
  )) {
    if (
      propertyKey !== "constructor" &&
      typeof descriptor.value === "function"
    ) {
      yield [propertyKey, descriptor];
    }
  }
}
