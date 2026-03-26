function classDec(klass, context) {
  expect(context.kind).toBe("class");
  return class Bar extends klass {
    static get original() {
      return klass;
    }
  };
}

let Foo;
@classDec
class Foo_ {
  value = 1;
}

Foo = Foo_;

expect(Foo).not.toBe(Foo_);
expect(Foo.name).toBe("Bar");
expect(Foo.original).toBe(Foo_);
expect(new Foo().value).toBe(1);
