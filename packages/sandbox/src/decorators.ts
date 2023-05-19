const foo = () => {
  return <This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >,
  ) => {
    const { kind, name = null } = context;
    console.log(`about to decorate ${kind} ${name as string}`);
  };
};

const bound = (method: any, context: ClassMethodDecoratorContext): void => {
  const { name } = context;
  if (context.private) {
    throw new Error(
      `'bound' cannot decorate private properties like ${name as string}.`,
    );
  }
  context.addInitializer(function (this: any) {
    this[name] = this[name].bind(this);
  });
};

class Person {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  @bound
  @foo()
  greet() {
    console.log(`Hello, my name is ${this.name}.`);
  }
}

const p = new Person("Ron");
p.greet();
