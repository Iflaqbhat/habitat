# Habitat Coding Tasks Guide

This is a living guide for authoring high-quality Habitat tasks from real PRs. Update it as we learn.

## Overview
Habitat tasks convert merged PRs into reproducible coding challenges. Each task must:
- Describe ONLY behaviors introduced/fixed by the PR.
- Include tests that fail on the base commit and pass with the golden patch.
- Maintain perfect 1:1 alignment between requirements and tests.

## Core Artifacts
- **golden.patch**: Production code only. No tests or docs.
- **test.patch**: New test files only. Filenames and test functions must include `__HABITAT`.
- **task_description.md**: Requirements with exact alignment to tests.

## Alignment Rules
- **1:1 mapping**: Every test assertion maps to a requirement; every requirement has a test. No extra claims.
- **Implementation-agnostic**: Test observable behavior and outputs, not internals.
- **New files only**: Do not modify existing tests.

## Base → Golden Workflow
1. Checkout base commit (parent of PR merge).
2. Apply `test.patch` (or create tests directly) and run tests → should fail.
3. Apply `golden.patch` (production changes).
4. Re-run tests → should pass.
5. Optional: run existing suite to check regressions.

## Verification Checklist
- Requirements cover only behaviors in PR.
- Tests reference only public behavior & outputs.
- Tests fail on base:
  - Build/test failure due to missing methods
  - Or assertions failing on old behavior
- Tests pass after golden patch.
- No regressions in core suites.
- Patch format valid (headers, no corruption, no trailing whitespace issues).

## Making Simple PRs Challenging (Within Scope)
- Add edge cases and boundary conditions (empty values, max/min, pagination corners).
- Assert deterministic ordering and tie-breakers.
- Validate pagination markers and exclusivity.
- Check spec nuances (nil vs empty, required fields, encoding).
- Include negative paths (malformed inputs, error codes).

## Common Pitfalls
- Tests asserting internals or relying on private symbols.
- Requirements claiming behavior not tested.
- Golden patch including tests/docs.
- Patch corruption (missing headers, trailing whitespace).
- Over-collecting results (ignoring limits like `MaxKeys`).

## Patch Authoring Tips
- Generate diffs from a clean working tree to avoid noise.
- Prefer `git diff` against the base commit for golden changes.
- Validate patches locally:

```bash
# Dry-run check
git apply --check prXXXX/test.patch
git apply --check prXXXX/golden.patch

# Apply
git apply prXXXX/test.patch
git apply prXXXX/golden.patch
```

If patches are hard to format, create files directly in the workspace and later generate clean diffs:

```bash
# Generate patch from created file
git diff -- worktree -- weed/s3api/new_test__HABITAT_test.go > prXXXX/test.patch
```

## Testing Commands

```bash
# Run Habitat tests only
go test -v ./weed/s3api -run "__HABITAT"

# Target specific tests
go test ./weed/s3api -run "TestListObjectVersions"
```

## task_description.md Template

```markdown
# Task: <Concise Behavior>

## Overview
<Explain high level behavior and scope.>

## Requirements
1. <Requirement A>
   - <Specifics as asserted by tests>
2. <Requirement B>
   - <Specifics>
...
```

## Test Skeleton Template

```go
package s3api

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestFeatureBehavior__HABITAT(t *testing.T) {
    t.Run("Scenario", func(t *testing.T) {
        // Arrange
        // Act
        // Assert
        assert.Equal(t, "expected", "actual")
    })
}
```

## Updating This Guide
When you encounter new constraints, quirks, or best practices (e.g., S3 spec nuances, pagination behaviors), add them here with examples and commands.

## Task Sizing & Compensation

- **Targets**:
    - $1200 tasks: AI success >0% and ≤50% (preferred sweet spot)
    - $200 tasks: AI success >50% and ≤90%
- **Time expectations**: Top contributors average 3–5 hours per $1200 task.
- **Design goal**: Choose behaviors and edge cases that are realistic, well-specified, and tricky enough to reduce naive AI success while staying strictly within PR scope.

### Calibrating Difficulty (Within Scope)
- **Layered coverage**: Build ~10 top-level tests; each with focused subtests:
    - Happy paths: minimal examples that must pass
    - Boundary cases: empty, nil, max/min, zero/one/many
    - Ordering rules: ties, stability, secondary sort keys
    - Pagination/markers: exclusivity, empty markers for non-version items
    - Spec quirks: nil vs empty, encoding, field presence
- **Negative cases**: Malformed inputs and error codes (assert specific errors)
- **Determinism**: Avoid randomness or external resources; use table-driven tests
- **Implementation-agnostic**: Assert outputs/behavior only; don’t depend on internals

### Subtest Strategy
- **Scalability**: Subtests can scale from a handful to thousands when applicable (e.g., table-driven inputs)
- **Chunking**: Group related cases to keep logs readable and failures diagnosable
## Hint Annotations (If Applicable)
- **Performance**: Keep the total runtime reasonable; prefer linear scans over heavy I/O
- **Memory safety**: Avoid generating massive in-memory data unless PR is about memory behavior

### Example Layout (10 tests)
- Merge & Sort (4 subtests)
- Truncation & Markers (4 subtests)
- Split Into Result (3 subtests)
- Collector Limits (4 subtests)
- Marker Filtering (1–3 subtests)
- Encoding/Field Presence (2–3 subtests)
- Error Codes/Validation (2–4 subtests)
- Legacy vs New Formats (2–3 subtests)
- Large Table-Driven Set (N subtests, deterministic)
- Integration-ish harness (structure/shape checks without external deps)

## Performance & Stability Checklist
- **Deterministic**: No timing/race-sensitive assertions; avoid sleeps
- **Fast**: Keep unit tests CPU-bound and small; avoid network/filesystem unless mocked
- **Isolated**: Don’t rely on global state or order across tests
- **Resource bounds**: Cap subtest counts to ensure CI friendliness; consider sampling for very large sets
- **Clear failures**: Use `require` for preconditions; make assertions precise

## Scoring Considerations
- The aim is not to “trap” AI but to reflect realistic complexity: multiple interacting rules, edge cases, and strict spec compliance.
- Prefer breadth across behaviors over obscure tricks.
- Ensure every claimed behavior is verifiable via tests and reproducible locally.
## CRITICAL: The 95% Problem—Selecting Top 5% Commits

**Reality Check**: SOTA AI coding agents (e.g., Claude Opus, o1-preview) solve ~95% of typical commits at 100% pass rate. Most PR-based tasks are too easy.

### What Makes a Commit Hard Enough (Top 5%)?

**Must have 1+ of:**
- **Codebase-wide understanding**: Changes touch 5+ files across multiple modules; require grasping how systems interact (e.g., filer ↔ volume server ↔ master coordination)
- **Helper function synthesis**: PR introduces 3+ new helper functions that must be correctly integrated; AI must design the right abstractions
- **Challenging algorithms**: Non-trivial logic with edge cases, ordering guarantees, pagination state, or performance constraints (e.g., distributed consensus, efficient merging, marker-based cursors)
- **Domain-specific knowledge**: Requires deep understanding of S3 spec quirks, FUSE semantics, replication topology, or seaweedfs architecture

### Red Flags—Avoid These (Too Easy)

- **Narrowly scoped**: Single function or file changed; isolated logic
- **Standard patterns**: Common refactors, simple bug fixes, boilerplate (e.g., adding validation, renaming)
- **Well-defined**: Solution obvious from PR description; no synthesis required
- **Dependency changes**: Requires installing new packages (can't happen at test time)

### Assessment Checklist Before Starting Task Creation

- [ ] PR touches **3+ distinct modules** or has **5+ changed files**
- [ ] **No single file** contains >70% of the changes (avoid narrow focus)
- [ ] PR introduces **2+ new helper functions** that interact non-trivially
- [ ] Logic includes **edge cases or state management** (pagination, ordering, concurrency)
- [ ] Requires understanding **how changed code integrates** with existing systems
- [ ] Problem is **not solvable by obvious pattern matching** from test names alone
- [ ] **Not a simple validation/error-handling** addition

If <3 checkmarks: **Too easy, skip it.**

### seaweedfs Examples: Top 5% vs. Too Easy

**❌ Too Easy (Skip):**
- **PR #7987 (ListObjectVersions delimiter)**: Single module (s3api), one file, algorithm contained within versioning logic
- **PR #7884 (HTTP headers)**: Two handler functions, standard validation pattern, obvious from requirements
- **PR #7992 (Volume mount conditional)**: Single line change in template, fixes specific condition check

**✅ Top 5% (Consider):**
- **PR #7989 (S3 configuration persistence)**: 
  - Touches auth_credentials.go, auth_signature_v4.go, s3_iam_middleware.go, auth_signature_v4_sts_test.go
  - Requires understanding: identity merging, static vs. dynamic config precedence, IAM integration, race conditions, concurrency patterns
  - Introduces complex merge logic with state tracking and nil guards
  - Must synthesize: static identity tracking, merge protocol, immutability preservation
  - **Checkmarks**: 7/7 ✅

- **PR #7988 (STS streaming authorization)**: 
  - Touches auth_signature_v4.go, auth_credentials.go, s3_iam_middleware.go, plus 265+ lines of tests
  - Requires understanding: S3 SigV4 streaming protocol, authorization flow, IAM fallback logic, identity types
  - Introduces refactored VerifyActionPermission() method; affects multiple auth paths
  - Must synthesize: authorization logic unification, IAM interface mocking, fallback conditions
  - **Checkmarks**: 6/7 ✅

- **PR #7996 (chown retry logic)**:
  - Touches abstract_sql_store.go (207 lines), mysql_store.go, retry.go, retry_test.go
  - Requires understanding: MySQL deadlocks/timeouts, transaction semantics, retry strategies, error categorization
  - Introduces new retry logic with error-type detection and transaction awareness
  - Must synthesize: error type routing, retry conditions, transaction boundary detection
  - **Checkmarks**: 6/7 ✅

- **PR #7974 (ShardsInfo memory optimization)**:
  - Massive refactor: 8+ files, map→slice migration, bitmap operations, binary search
  - Requires understanding: data structure tradeoffs, cache locality, concurrent access patterns, lock safety
  - Introduces ShardBits type, sorted slice invariants, binary search, deadlock prevention
  - Must synthesize: O(1) vs O(log n) tradeoffs, bitmap operations, lock-free construction patterns
  - **Checkmarks**: 7/7 ✅ (Top difficulty)

---

## The #1 Rule: Perfect 1:1 Alignment (Most Common Rejection Reason)

### Definition
- **Every test assertion** must map to something in the task_description.md
- **Every requirement** in task_description.md must have corresponding test assertions
- **No undocumented behavior**; no untested requirements

### How to Verify Alignment
1. Extract all requirements from task_description.md (list by number/heading)
2. Map each requirement to tests:
   - Note which test function(s) and subtest(s) verify it
   - Trace specific assertions that validate the requirement
3. Cross-check every test:
   - For each test assertion, identify which requirement it validates
   - If an assertion doesn't map to a requirement, either remove it or add the requirement
4. Audit for gaps:
   - Missing requirement? Add it to the description.
   - Missing test? Add a subtest.
   - Loose assertion? Tighten or remove.

### Practical Checklist
- [ ] Requirements are behaviorally specific (not vague)
- [ ] Tests assert exactly what requirements claim (no more, no less)
- [ ] No "implementation detail" tests (e.g., testing private method calls)
- [ ] No "aspirational" requirements not validated by tests
- [ ] Test failures clearly trace back to a requirement

### Good Alignment Example

**task_description.md:**
```
## Requirement 1: Merge Versions and Prefixes
When delimiter is specified, versions and common prefixes must be combined and sorted lexicographically.
- Versions come before prefixes for the same key
- Multiple versions are sorted by version ID
```

**Test:**
```go
func TestBuildSortedCombinedList__HABITAT(t *testing.T) {
    t.Run("Versions come before prefixes for same key", func(t *testing.T) {
        combinedList := s3a.buildSortedCombinedList(allVersions, commonPrefixes)
        // Assert: versions at indices 0-1, prefix at index 2 for same key
        assert.False(t, combinedList[0].isPrefix)
        assert.False(t, combinedList[1].isPrefix)
        assert.True(t, combinedList[2].isPrefix)
    })
}
```

✅ **Aligned**: Test directly validates requirement claims.

### Bad Alignment Example

**task_description.md:**
```
## Requirement 1: Sorting
Results must be sorted.
```

**Test:**
```go
func TestSorting__HABITAT(t *testing.T) {
    s := newSorter()
    s.internalSort()  // Testing internal method
    assert.True(t, s.isSorted)  // Vague assertion
}
```

❌ **Misaligned**: Vague requirement, internal method tested, unclear assertion.

---

## Example 1: "Too Hard" Real-World Task (Blender PR #138614)

**Task**: "Add swizzle support to `VecBase<T, Size>`"
**Status**: ⚠️ **Marked "Too Hard"** - AI agents consistently fail

### Why It Was Too Difficult

**Scope Explosion**:
- **765 lines of golden patch** (vs. 300-400 typical)
- **376-line new header file** for swizzle implementation alone
- Touches 13+ files across multiple modules (math, GPU, mesh, transforms, rendering)
- 294-line test file with compile-time trait assertions

**Complex Interdependencies**:
- Must understand C++ template metaprogramming (specialization, SFINAE, union patterns)
- Must understand compiler-specific pragmas and workarounds (GCC, Clang, MSVC)
- Implementation is NOT straightforward from requirements—requires deep knowledge of:
  - Type traits (`std::is_trivial_v`, `std::is_assignable_v`)
  - Memory layout (unions, nested structs, alignment)
  - Pointer casting and reinterpret_cast safety
  - Compile-time static assertions and branch conditions

**Compile-Time Verification is Tricky**:
- 25+ `BLI_STATIC_ASSERT` compile-time checks in test file
- Verifying `std::is_assignable_v<decltype(float3().yx()), float2>` returns FALSE is non-obvious
- Getting assignability conditionally correct (only sequential, contiguous swizzles) is nuanced

**Implementation Constraints Are Subtle**:
- Must preserve `std::is_trivial_v<float3> == true` (no non-trivial copy constructors)
- Must preserve `sizeof(float3) == 3 * sizeof(float)` (no padding)
- Union pattern with correct alignment to enable both read-only and read-write variants
- Memory layout must match first component in swizzle (for safe copy semantics)

**Why AI Failed**:
- Template specialization patterns require deep Blender context
- The "right" design (union + nested structs + reinterpret_cast) is not obvious
- Union edge cases (repeated components, alignment, compiler quirks) are hard to predict
- Many subtle constraints (triviality, size, assignability) create interdependent failures

### Lessons for Habitat Task Selection

**Red Flags for "Too Hard"**:
- ✗ Requires 700+ lines of changes
- ✗ Deep C++ metaprogramming (templates, SFINAE, type traits)
- ✗ Compiler-specific pragmas and workarounds needed
- ✗ Implementation constraints that shadow actual requirements
- ✗ Edge cases that require deep domain knowledge (memory layout, alignment, C++ semantics)
- ✗ Design choices that seem obvious only in hindsight

**How to Avoid This**:
- Target **200-400 lines** of golden patch (sweet spot)
- Focus on **behavioral complexity**, not **implementation complexity**
- Choose tasks where the design is clearer or more standard
- Avoid compiler-specific workarounds and low-level memory manipulation
- Prefer tasks where requirements naturally map to code structure

---

## Example 2: "Perfect Difficulty" Real-World Task (Blender PR eab747e8)

**Task**: "Implement Robust BMesh Edge Dissolve Rules"
**Status**: ✅ **In Distribution** - AI success rate 0-50% (ideal sweet spot)

### Why This Task Is Perfect

**Right Scope**: 
- **219 lines of golden patch** (well within 200-400 target)
- **5 focused test files** (modest scope, each test one scenario)
- Touches 2 files (bmo_dissolve.cc, editmesh_tools.cc) - contained scope

**Behavioral Complexity Without Deep Expertise**:
- Multiple interacting rules: chain traversal, loop detection, corner preservation, T-junction handling, non-manifold guard
- Requires understanding graph traversal and geometry state machine concepts
- Does NOT require:
  - Deep C++ metaprogramming (no templates, SFINAE, type traits)
  - Compiler-specific workarounds
  - Memory layout manipulation or pointer casting tricks
  - Domain-specific obscure knowledge

**Clear Requirement-to-Test Mapping**:
1. **Dissolve Chain Traversal** → `__bmesh_dissolve_loop_selection_no_end__HABITAT.py` (tests closed loops)
2. **Loop-Cut Crossings** → `__bmesh_dissolve_loopcut_crossing__HABITAT.py` (tests crossing chains)
3. **T-Junction Handling** → `__bmesh_dissolve_loopcut_T_end__HABITAT.py` (tests T-endings on loop cuts)
4. **Corner Preservation** → `__bmesh_dissolve_corner_multi_sections__HABITAT.py` (tests single-chain corners)
5. **Non-Manifold Guard** → `__bmesh_dissolve_nonmanifold_guard__HABITAT.py` (tests non-manifold protection)

**Implementation Is Learnable**:
- Golden patch adds helper functions: `bmo_find_end_of_chain()`, `bmo_vert_touches_unselected_face()`, `bmo_vert_tagged_edges_count_at_most()`
- The pattern is clear: traverse chains, check geometric conditions, mark/unmark vertices
- No "aha!" moments required; synthesis is straightforward from requirements

**Tests Are Implementation-Agnostic**:
- Each test creates a geometry scenario, applies dissolve, checks observable results
- No white-box checks of internal state or data structures
- Tests are end-to-end Python scripts using BMesh public API

### Contrast: Why This Succeeds Where Swizzle Failed

| Aspect | Too Hard (Swizzle) | Perfect (Edge Dissolve) |
|--------|-------------------|------------------------|
| Lines of Code | 765 | 219 |
| File Count | 13 | 2 |
| Domain Expertise | C++ metaprogramming | Graph/geometry logic |
| Hidden Constraints | Many (triviality, alignment, assignability) | Few (explicit in rules) |
| Design Obviousness | Hindsight-dependent (union patterns) | Straightforward (traversal + conditions) |
| Test Count | 1 large file (294 lines) | 5 focused files (70-85 lines each) |
| Learnable Without Deep Knowledge | ❌ No | ✅ Yes |

### Lessons for Task Selection

**Indicators of "Perfect Difficulty"**:
- ✅ 200-400 lines golden patch
- ✅ 2-5 focused files (not touching entire codebase)
- ✅ Multiple behavioral rules that interact, but each is clear
- ✅ No language-specific metaprogramming or compiler quirks
- ✅ Tests are end-to-end, observable behavior
- ✅ Clear mapping: requirement → test scenario
- ✅ Helper functions that are learnable (traversal, conditions, state tracking)
- ✅ Geometry/logic complexity, not implementation complexity

**Success Probability Indicators**:
- If requirements are clear and modular → higher success
- If tests are comprehensive and focused → easier to debug failures
- If design is iterative (chain → condition → mark) → learnable synthesis
- If domain is standard algorithms/logic → AI can reason about it

---

## The Perfect Task Checklist: From Example 2

Use this checklist to verify a task is "perfect difficulty":

### Success Rate ✅
- [ ] AI succeeds >0% but ≤50% of attempts (not impossible, not easy)
- [ ] Some runs reach full solution; others fail at specific steps
- [ ] Failures are learnable (not random/impossible)

### Unambiguous Description ✅
- [ ] No vague terms ("robust", "efficient", "clean", "proper")
- [ ] All behavioral claims are precise and measurable
- [ ] Reader cannot reasonably misinterpret requirements
- [ ] Edge cases are explicit (not hidden)

### Perfect 1:1 Alignment ✅
- [ ] Every test assertion maps to a description requirement
- [ ] Every description requirement has test coverage
- [ ] No "implied" or "obvious" requirements not tested
- [ ] No test coverage for undescribed behaviors
- [ ] Audit: map each requirement → test; map each test → requirement

### Fair Failures ✅
- [ ] When AI fails, it's due to implementation challenge, not unclear spec
- [ ] Failed test output + description should make failure debuggable
- [ ] Requirements are not contradictory or incomplete
- [ ] No "gotchas" that violate assumptions about the domain

### Scope & Complexity ✅
- [ ] Golden patch: 200-400 lines (not 700+, not 50)
- [ ] Files touched: 2-5 (not 13, not 1)
- [ ] Domain complexity: learnable logic/algorithms (not metaprogramming)
- [ ] Helper functions needed: 2-4 (clear abstractions)

### Test Quality ✅
- [ ] 5-10 focused test scenarios (not 1 giant test, not 50 micro-tests)
- [ ] Each test is end-to-end, observable behavior (not white-box internals)
- [ ] Tests are isolated and deterministic (no flakiness)
- [ ] Test naming clearly indicates scenario being tested

---

## Summary: The Habitat Framework

You now understand:

1. **Why 95% of commits are too easy** → Select top 5% (codebase-wide, algorithmic, domain-specific)
2. **How to assess difficulty** → 7-point checklist, contrast with examples
3. **How to structure tasks** → 3 patches (base, golden, test), perfect alignment
4. **How to calibrate difficulty** → 200-400 lines, behavioral complexity, learnable synthesis
5. **Why some tasks fail** → Scope explosion, metaprogramming, hidden constraints
6. **Why some tasks succeed** → Clear rules, focused tests, learnable patterns
7. **How to rescue hard tasks** → Simplify, find easier commit, add hints
8. **Compensation model** → $1200 for 0-50% success targets

**Next**: Apply this framework to select and create your first real seaweedfs Habitat task.

---

## QA & Annotations Phase

After your task runs against 10 AI attempts, you must complete QA before approval.

### Fair vs. Unfair Failures

**Fair Failure** (good - indicates good task design):
- AI had complete information in task description ✅
- AI understood requirements but failed to implement correctly ✅
- Test accurately reflects a description assertion ✅
- → Failure is due to implementation challenge, not unclear spec

**Unfair Failure** (bad - indicates task needs revision):
- ❌ Task description was ambiguous about this requirement
- ❌ Test checks something not explicitly mentioned in description
- ❌ AI would need to guess implementation details
- → Failure is due to unclear spec or scope creep, not synthesis challenge

### Iterative Refinement (Expected Workflow)

If QA reveals unfair failures:
1. **Review failed AI attempts** → Identify common failure patterns
2. **Diagnose root cause**:
   - Is description ambiguous?
   - Does test check undescribed behavior?
   - Is domain knowledge assumed but not explained?
3. **Fix task description** (or tests, if scope crept)
4. **Resubmit** for another 10 AI runs
5. **Repeat** until all failures are fair (clear spec, hard synthesis)

**Important**: Iteration is normal and expected. A good task may need 2-3 cycles of QA → fix → resubmit before approval.

### QA Checklist

Before marking task as approved:
- [ ] Reviewed all failed AI attempts (from 10 runs)
- [ ] Identified failure patterns and root causes
- [ ] Verified all failures are "fair" (not due to ambiguity)
- [ ] If unfair failures found, fixed description/tests and resubmitted
- [ ] Success rate is 0-50% (not too easy, not impossible)
- [ ] Task description is final and unambiguous
- [ ] 1:1 alignment verified (audit: each requirement ↔ test)

### Run Annotations: Document Each Failure

For every AI failure from the 10 runs, create a detailed annotation:

**Three Required Elements**:

1. **Map to Task Description**
   - Cite the specific line/requirement the test validates
   - Make the connection explicit and traceable
   - Example: "This test validates the requirement: 'Closed chains must not lose interior vertices due to incorrect endpoint detection'"

2. **Explain Why AI's Solution Is Incorrect**
   - What did the AI implement wrong?
   - What logic error or misunderstanding caused the failure?
   - What does the test output show?
   - Example: "AI implementation treated a closed loop as if it had endpoints, marking an interior vertex for removal when no true chain endpoints exist in a loop"

3. **Explain Why Expected Output Is Correct**
   - Why is the expected behavior the *only* correct one?
   - What would break if AI's approach were accepted?
   - How does expected output align with the requirement?
   - Example: "A closed loop has no geometric entry/exit points. Every vertex is interior. Removing any vertex breaks loop topology. Expected output correctly preserves loop structure by not spuriously marking interior vertices"

**Example Annotation**:
```
Failure: __bmesh_dissolve_loop_selection_no_end__HABITAT.py

Maps to: Task Description, "Dissolve Chain Traversal and Loop Handling"
  Requirement: "The algorithm must correctly distinguish between open chains 
               (with two endpoints) and closed chains (forming a loop with no endpoints). 
               Closed chains must not incorrectly treat any vertex as an end of the chain."

Why AI Failed:
  AI's chain-walking algorithm only checked for the start condition (entering a loop)
  but failed to recognize that a closed loop has no exit condition. It incorrectly
  identified one vertex in the closed loop as a "chain endpoint" and marked it for 
  dissolution. This violates the geometric requirement that closed loops have no endpoints.

Why Expected Output Is Correct:
  In a closed chain, every vertex has exactly two incident selected edges (interior vertex).
  There are zero "endpoints" by definition. Removing any vertex would break the loop topology.
  The correct behavior is to preserve the loop or collapse it as a whole, never remove an
  arbitrary interior vertex due to mistaking it for an endpoint. The expected output preserves
  at least N-1 vertices (where N is initial count), maintaining loop connectivity.
```

**Purpose**: These annotations serve as:
- Proof that failures were fair (AI had all needed info)
- Documentation of what the task teaches
- Evidence that the task is genuinely challenging
- Training data for understanding AI failure modes

---

## Test Annotations (Per-Test Requirements)

For every test and each assertion in your `test.patch`, you must add annotations that:

- Quote exactly the sentence (or bullet) from the task description that the assertion verifies
- Explain why the assertion is a fair evaluation of that requirement (behavioral, observable, implementation-agnostic)

### Annotation Template

```
Test: <file/test name>
Assertion: <what is being asserted>

Maps To (Exact Quote):
"<paste exact sentence from task_description.md>"

Fairness Justification:
- Observable behavior only; no internals checked
- Matches the scope and specificity of the quoted requirement
- Failure indicates incorrect implementation, not missing or ambiguous spec
```

### Concrete Example (From BMesh Dissolve)

- Test: `tests/python/__bmesh_dissolve_loopcut_crossing__HABITAT.py`
- Assertion: Center vertex at (0,0,0) must dissolve when vertical and horizontal dissolved chains cross

Maps To (Exact Quote):
"If two or more dissolved chains cross at a vertex (for example, one horizontal chain and one vertical chain intersecting), that shared intersection vertex must be dissolved to maintain a continuous result along both directions."

Fairness Justification:
- End-to-end geometry scenario using public BMesh API; no internal state inspected
- The assertion checks exactly the stated behavior at the crossing point—nothing more
- Any failure means the dissolve rule wasn’t implemented, not that the requirement was unclear

### Submission Guidance

- Provide one concise annotation per top-level assertion (subtests in Go, checks in Python)
- Keep the quote verbatim to maintain traceable 1:1 alignment
- Place annotations alongside your task artifacts (e.g., in a `annotations.md` or within the task submission form)
## Living Guide Principle

**This guide grows with every task created.** When you learn:
- A new failure pattern → document it
- A better phrasing for ambiguous concepts → add example
- An edge case to watch for → add to checklist
- A trick that helps calibrate difficulty → record it

---

## Compensation & Timeline

- **$1,200**: Tasks with AI success >0% and ≤50% (target sweet spot)
- **$200**: Tasks with AI success >50% and ≤90% (still paid, not ideal)
- **Expected contributor time**: 3–5 hours per $1,200-quality task

### Commit Reservation
- Reserve the **base commit**: the parent of the merge commit
- Reservations last **3 days** and refresh when you work on the commit
- Steps:
  - Find a well-tested PR after the repo cutoff date
  - Click merge commit → select its parent hash → reserve

### Workflow Timeline
- Day 0: Reserve base commit; extract requirements; author test + golden patches
- Day 1: Verify base→golden (fail then pass); submit for 10 AI runs
- Day 2+: Perform QA
  - Annotate failures (fair vs. unfair)
  - If ambiguity found, fix description/tests and resubmit
  - Iterate until success rate and fairness meet the bar

### Compensation Updates Policy
- Compensation may change over time as the project evolves
- Any tasks you complete at a given compensation tier will be paid at that tier, even if rates change later

### Expected Timeline & Capacity
- First task: may take **20+ hours** as you learn the process end-to-end
- Subsequent tasks: average **3–5 hours** for top creators
- Per repository: we accept **30 good tasks** (first come, first serve)

**Use this guide for every repository and PR.** Each lesson learned applies across seaweedfs, Blender, Rust, and all future Habitat tasks.

---

## Iteration & Learning Curve

- Expect multiple QA cycles before your first approval; iteration is normal
- Early tasks can take significantly longer (20+ hours) while you internalize the framework
- It gets faster: experienced task creators average 3–5 hours per task
- Treat feedback as data: refine description clarity, tighten 1:1 alignment, and add targeted hints only when needed

## Long-Term Opportunity

- Over the next 6 months, dozens to hundreds of repositories will need Habitat tasks
- We’re looking for contributors who can meaningfully participate throughout this period
- Per-repo capacity: 30 good tasks accepted (first come, first serve)

---

## Payment & Onboarding

- Payments are processed via **Deel**, a global payroll platform supporting contractors in 150+ countries
- After your first approved task, you’ll receive a **Deel invite** to set up your account
- For any payment questions, reach out via **Slack** and we’ll assist directly

---

## Tips for Success

- **Pick top-5% commits**: Multi-file, behavioral complexity, clear integration points; skip narrow one-file fixes
- **Perfect 1:1 alignment**: Write requirements that match tests exactly; no extra claims, no untested behavior
- **Prefer behavioral over internal**: Test observable outputs; avoid checking private methods, data structures, or variable names
- **Right-size changes**: Aim for 200–400 lines of golden patch across 2–5 files; avoid scope explosions
- **Leverage existing tests**: Start from well-tested PRs; adapt tests with `__HABITAT` markers rather than writing from scratch
- **Verify base→golden**: Ensure tests fail on base and pass with golden; this proves the task actually measures the intended behavior
- **Table-driven subtests**: Use scalable, deterministic subtests where appropriate; keep runtime reasonable
- **Add hints only when needed**: Use `<HINT>...</HINT>` to clarify ambiguity, not introduce new rules; annotate hints per guidance
- **Annotate failures**: For each failing run, map assertion to an exact requirement quote and justify fairness
- **Keep patches clean**: Validate patch format (`git apply --check`), avoid trailing whitespace and unrelated changes
- **Time-box learning**: First task may take 20+ hours; after a few cycles, expect 3–5 hours per task
- **Reserve smartly**: Reserve the parent of the merge commit; keep reservations fresh by working regularly
- **Calibrate difficulty**: If success is ~0%, simplify scope or add targeted hints; if success is >50%, add meaningful edge cases (still within scope)
- **Document lessons**: Continuously update this guide with new pitfalls, phrasing improvements, and calibration tricks

---

## Submission Checklist & Pro Tips

### #1 Verify Test–Description Alignment (30-minute check)
- Map each test assertion to the exact sentence in your description
- Confirm each requirement in the description has at least one test
- This single pass prevents most rejections by enforcing perfect 1:1 alignment

### Find Well-Tested PRs
- Use AI repo explorers (e.g., Claude Code) to locate PRs with strong tests
- Ensure the commit date is after the repository’s cutoff date

### Learn from Examples
- Review reserved commits and approved example tasks to model structure and clarity

### Downscope Freely
- If a PR includes untested behavior, omit it from the task description
- Only require behaviors your tests actually verify

### Test Locally First
- Validate that tests fail on the base commit and pass with the golden patch before submission

### Pro Tips
- End-to-end testable features are easiest to work with
- Reservations refresh when you work; if inactive, reservations expire after ~1 week
- Use Claude Code (or similar) to quickly explore unfamiliar repos and find well-tested PRs
- When a task is too hard: add targeted hints based on observed AI failure modes (and annotate them)