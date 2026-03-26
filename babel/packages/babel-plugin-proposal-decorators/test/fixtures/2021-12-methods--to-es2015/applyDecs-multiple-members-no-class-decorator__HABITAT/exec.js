function dec(fn, context) {
  context.addInitializer((instance) => {
    instance[context.name + "Context"] = context;
  });
  return function () {
    return fn.call(this) + 10;
  };
}

class Foo {
  value = 1;

  @dec
  #a() {
    return this.value;
  }

  @dec
  #b() {
    return this.value * 2;
  }

  callA() {
    return this.#a();
  }
  callB() {
    return this.#b();
  }
}

let foo = new Foo();
expect(foo.callA()).toBe(11);
expect(foo.callB()).toBe(12);
expect(foo["#aContext"].name).toBe("#a");
expect(foo["#bContext"].name).toBe("#b");

foo.value = 5;
expect(foo.callA()).toBe(15);
expect(foo.callB()).toBe(20);
