export const named = (name: string) => {
  return (
    target: object,
    propertyKey?: string | symbol,
    parameterIndexOrDescriptor?: any,
  ): void => {
    if (parameterIndexOrDescriptor != null) {
      if (typeof parameterIndexOrDescriptor === "number") {
        // constructor or method parameter
      } else {
        // method
      }
    } else {
      // property
    }
  };
};

@named("foo")
export class Foo {
  @named("dep")
  bar!: string;

  constructor(@named("baz") baz: string) {}
}
