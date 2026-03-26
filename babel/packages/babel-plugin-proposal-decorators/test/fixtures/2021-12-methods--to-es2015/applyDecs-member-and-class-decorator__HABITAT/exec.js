function memberDec(fn, context) {
  return function () {
    return fn.call(this) + 1;
  };
}

function classDec(klass, context) {
  expect(context.kind).toBe("class");
  return class Wrapped extends klass {
    static get original() {
      return klass;
    }
  };
}

let Foo;
@classDec
class Foo_ {
  value = 1;

  @memberDec
  #m() {
    return this.value;
  }

  callM() {
    return this.#m();
  }
}

Foo = Foo_;

expect(Foo).not.toBe(Foo_);
expect(Foo.name).toBe("Wrapped");
expect(Foo.original).toBe(Foo_);

const inst = new Foo();
expect(inst.callM()).toBe(2);
expect(inst.value).toBe(1);
