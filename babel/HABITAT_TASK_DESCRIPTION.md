# Habitat form – copy-paste values

## Base commit (full 40 chars)
```
4bb9b89b2dd60fcbe1d6512bf40b5fef57aeacf0
```

## Merge commit (full 40 chars)
```
0b29359f9ab1e9773aa858e79271587397013a27
```

**Note:** If Habitat reports that this merge commit is not on `main`, use a merge commit from the default branch that contains the same fix (PR #14334), or reserve the base commit and use the same patch content.

---

## Task Description (paste into the "Task Description" field)

Fix the `applyDecs` helper so that the **return array** has the correct length and content. The decorators transform destructures this array; if an extra element is pushed when the class has no class decorators, runtime breaks (e.g. the wrong value is used as the instance initializer).

### Core rule

- **No class decorators** → Do **not** push `newClass` onto the return array. The array must contain only: member decorator results (initializers, method/accessor wrappers) and the instance/static initializer runners.
- **Has class decorators** → Push the (possibly decorated) class as `newClass` after applying class decorators. Member decoration and initializer runners must still run and be pushed as before.

### Behavior to implement

**1. Classes with only member decorators (no class decorator)**

- **Single private method:** One decorated private method, decorator uses `addInitializer` and returns a wrapper (e.g. value + 1). At runtime: the decorated method returns the wrapped value; the context stored via `addInitializer` has correct `name` (e.g. `"#a"`), `kind` (`"method"`), `isStatic` (`false`), `isPrivate` (`true`); `addInitializer`, `setMetadata`, and `getMetadata` are functions; calling via the instance and via `context.access.get` gives the same result; changing instance state and calling again gives the updated decorated value.
- **Multiple private methods:** Two decorated private methods. Both run with their decorated behavior; both contexts are stored with correct `name`; changing instance state and calling both again gives correct values.
- **Static private method:** One decorated static private method. Static method runs with decorated behavior; context has `isStatic` and `isPrivate` true; updating the static field and calling again gives the updated value.
- **Public method:** One decorated public method. Method runs with decorated behavior; context has correct `name` and `isPrivate` false.

**2. Classes with class decorators**

- **Class decorator only:** Class has a class decorator and no member decorators. Class decorator receives context with `kind` `"class"` and returns a new class (e.g. `Bar`). The binding from `applyDecs` must be that returned class, not the original. The returned class has the expected name; the original is accessible (e.g. via a static getter); `new Foo().value` works.
- **Class and member decorators:** Class has both a class decorator and a private method decorator. The binding from `applyDecs` must be the class returned by the class decorator; the original is accessible; instantiating and calling the decorated method works (e.g. method returns value + 1, instance field is correct).

**3. Return array behavior**

- Push `newClass` onto the return array only when `classDecs.length > 0`.
- Always run member decoration and push proto/static initializer runners so the array length and order match what the transform expects.
