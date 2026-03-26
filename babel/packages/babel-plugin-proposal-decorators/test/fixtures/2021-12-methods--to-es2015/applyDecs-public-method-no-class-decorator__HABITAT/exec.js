function dec(fn, context) {
  context.addInitializer((instance) => {
    instance[context.name + "Context"] = context;
  });
  return function () {
    return fn.call(this) * 2;
  };
}

class Foo {
  @dec
  a() {
    return 1;
  }
}

let foo = new Foo();
expect(foo.a()).toBe(2);
expect(foo["aContext"].name).toBe("a");
expect(foo["aContext"].isPrivate).toBe(false);
