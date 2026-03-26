# Habitat Submission: PR #14334 – applyDecs newClass fix

## Quick reference

| Field | Value |
|-------|--------|
| **Repository** | babel/babel |
| **Task Name** | Fix applyDecs newClass return array for classes without class decorators |
| **Merge Commit Hash** | `0b29359f9ab1e9773aa858e79271587397013a27` |
| **Base Commit Hash** | `4bb9b89b2dd60fcbe1d6512bf40b5fef57aeacf0` |
| **PR Number** | 14334 |

**pr_consistency:** If Habitat says the merge commit is not on `main`, use a merge commit from the default branch that contains the same fix (PR #14334), or follow their guidance for non-main merge commits.

**Resubmitting after validation:** Use the **Test Patch** file from this repo (`test.patch`). It has all 10 new fixtures under directories ending with `__HABITAT` (private-with-initializers__HABITAT, public-with-initializers__HABITAT, static-private-with-initializers__HABITAT, static-public-with-initializers__HABITAT, plus the 6 applyDecs/class-decorator __HABITAT fixtures). Re-upload this file if the validator reported "missing __HABITAT".

## Patch layout (per Habitat feedback)

- **Base Patch** – **Required.** Modifications to *existing* test files only. The AI must not modify existing tests; these changes prepare the test setup.
  - **`base.patch`** – Simplifies the 4 existing fixtures (removes context tests from `exec.js`):
    - `private/exec.js`
    - `public/exec.js`
    - `static-private/exec.js`
    - `static-public/exec.js`

- **Golden Patch** – **Implementation only.** No test code.
  - **`golden.patch`** – Only the fix in `packages/babel-helpers`:
    - `packages/babel-helpers/src/helpers/applyDecs.js`
    - `packages/babel-helpers/src/helpers-generated.ts`

- **Test Patch** – **New test files only.** All new fixtures use `__HABITAT` in the folder name.
  - **`test.patch`** – Adds 10 new fixtures (all with `__HABITAT` in path):
    - 4 from PR (renamed): `private-with-initializers__HABITAT/exec.js`, `public-with-initializers__HABITAT/exec.js`, `static-private-with-initializers__HABITAT/exec.js`, `static-public-with-initializers__HABITAT/exec.js`
    - 6 __HABITAT: `applyDecs-no-class-decorator__HABITAT`, `applyDecs-multiple-members-no-class-decorator__HABITAT`, `applyDecs-static-member-no-class-decorator__HABITAT`, `applyDecs-public-method-no-class-decorator__HABITAT`, `class-decorator-return-value__HABITAT`, `applyDecs-member-and-class-decorator__HABITAT`

## Apply order

1. Start at **base commit** `4bb9b89b2dd60fcbe1d6512bf40b5fef57aeacf0`
2. Apply **base.patch** (test setup: simplify 4 existing exec.js)
3. Apply **golden.patch** (implementation fix only)
4. Apply **test.patch** (all new test fixtures)

Verification: `git checkout <base>`, `git apply base.patch`, `git apply golden.patch`, `git apply test.patch` — all apply cleanly.

## Habitat form checklist

1. **Repository:** babel/babel  
2. **Task Name:** Fix applyDecs newClass return array for classes without class decorators  
3. **Merge Commit Hash:** `0b29359f9ab1e9773aa858e79271587397013a27`  
4. **PR Number (optional):** 14334  
5. **Base Commit Hash:** `4bb9b89b2dd60fcbe1d6512bf40b5fef57aeacf0`  
6. **Task Description:** Paste from `HABITAT_TASK_DESCRIPTION.md`  
7. **Base Patch:** Upload **`base.patch`**  
8. **Golden Patch:** Upload **`golden.patch`**  
9. **Test Patch:** Upload **`test.patch`**  

## Regenerating patches (UTF-8 on Windows: use `cmd /c`)

- **golden.patch:**  
  `cmd /c "git diff 4bb9b89b2dd60fcbe1d6512bf40b5fef57aeacf0 0b29359f9ab1e9773aa858e79271587397013a27 -- packages/babel-helpers/src/helpers/applyDecs.js packages/babel-helpers/src/helpers-generated.ts > golden.patch"`

- **base.patch:**  
  `cmd /c "git diff 4bb9b89b2dd60fcbe1d6512bf40b5fef57aeacf0 0b29359f9ab1e9773aa858e79271587397013a27 -- packages/babel-plugin-proposal-decorators/test/fixtures/2021-12-methods--to-es2015/private/exec.js packages/.../public/exec.js packages/.../static-private/exec.js packages/.../static-public/exec.js > base.patch"`

- **test.patch:** (1) 4 *-with-initializers: same `git diff base merge --` those 4 dirs `> test.patch`. (2) Append the 6 __HABITAT diff (from `git diff --cached base` after adding the __HABITAT exec.js files) to `test.patch`.

## What the tests do (1:1 with description)

- **4 *-with-initializers** – Private/public and static/instance fixtures with `addInitializer` and context assertions (name, kind, isStatic, isPrivate, addInitializer, setMetadata, getMetadata).
- **6 __HABITAT** – applyDecs-no-class-decorator, applyDecs-multiple-members-no-class-decorator, applyDecs-static-member-no-class-decorator, applyDecs-public-method-no-class-decorator, class-decorator-return-value, applyDecs-member-and-class-decorator (see task description for each).
