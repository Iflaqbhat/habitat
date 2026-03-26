function dec(fn, context) {
  context.addInitializer((instance) => {
    instance[context.name + "Context"] = context;
  });
  return function () {
    return fn.call(this) + 100;
  };
}

class Foo {
  static value = 1;

  @dec
  static #a() {
    return this.value;
  }

  static callA() {
    return this.#a();
  }
}

const aContext = Foo["#aContext"];
expect(aContext.access.get.call(Foo).call(Foo)).toBe(101);
expect(Foo.callA()).toBe(101);
Foo.value = 2;
expect(Foo.callA()).toBe(102);
expect(aContext.isStatic).toBe(true);
expect(aContext.isPrivate).toBe(true);
