You are creating a Habitat task.

Your goal is NOT to implement code.
Your goal is to DESIGN a task that exposes predictable AI failures while remaining fully fair and deterministic.

The repository, language, and domain can be anything.

Follow ALL rules below strictly.

---

## 1. TASK SELECTION RULES

Select a change (PR or commit) that satisfies AT LEAST ONE of the following:

- Introduces a new abstraction, type, or layer
- Refactors existing logic into shared / common code
- Extends an existing system with new behavior
- Requires preserving backward compatibility
- Requires interaction between two or more subsystems
- Has a “correct but subtle” implementation

DO NOT select:
- Performance-only changes
- Documentation-only changes
- Test-only changes
- Mechanical renames with no behavior change

---

## 2. TRAP DESIGN (MANDATORY)

The task MUST include at least ONE of these AI traps:

### Trap A — Structural vs Semantic
The AI is likely to produce a result that is logically correct but structurally incorrect.
Tests must assert exact structure, formatting, or representation.

### Trap B — Wrong Helper / Wrong API
There must exist:
- an obvious but incorrect function/API
- a correct but less obvious function/API
Tests must fail if the wrong one is used.

### Trap C — Backward Compatibility
Existing behavior must remain unchanged.
Include at least one test that fails if legacy behavior is broken.

### Trap D — Hidden Contract
The prompt must not explicitly mention all constraints.
Tests enforce behavior not spelled out word-for-word in the description.

### Trap E — Empty / Zero / Default Case
Include a case where no data, zero values, or defaults are involved.
AI must handle it correctly.

### Trap F — Identity vs Equality
Tests must check object identity (same instance), not just equivalence.

### Trap G — Cross-Layer Reasoning
The change must affect multiple layers or modules.
Local fixes must be insufficient.

### Trap H — Mandatory Method / Hook
A required method, hook, or override must exist.
Failure should occur at compile-time or early runtime.

---

## 3. FAIRNESS RULES (STRICT)

The task MUST be fair:

- All required APIs must already exist in the codebase
- No undocumented behavior may be required
- The golden solution must NOT introduce new abstractions
- The failure must be explainable in one sentence
- Tests must be deterministic (no timing, randomness, environment dependence)

If any ambiguity exists, CLARIFY THE PROMPT.

---

## 4. PROMPT WRITING RULES

When writing the task description:

- Describe WHAT needs to change, not HOW
- Avoid naming specific helper functions unless unavoidable
- Do not describe internal implementation order
- Do not mention exact formatting unless required by tests
- Assume the AI will take shortcuts — design against them

---

## 5. TEST DESIGN RULES

Tests must:

- Fail for common AI shortcuts
- Pass for the golden implementation
- Prefer exact string / AST / structure matching
- Include at least one regression test
- Include at least one negative case (unsat / error / invalid / empty)

---

## 6. OUTPUT FORMAT (MANDATORY)

Produce the Habitat task with the following sections:

### Task Description
Clear, high-level description of the required behavior.

### Requirements
Bullet list of observable behavior requirements.

### Out of Scope
Explicitly list what is NOT required.

### Hints (Optional)
Only include hints if the task would otherwise be ambiguous.
Hints must not give away the solution.

### Failure Modes This Task Targets
List the AI mistakes this task is designed to catch.

---

## 7. SELF-CHECK (REQUIRED)

Before finalizing, answer these questions internally:

- What shortcut will an AI most likely take?
- Which test will fail because of that shortcut?
- Can a human explain the failure in one sentence?
- Does the task still make sense if the repo was different?

If any answer is “no”, redesign the task.

---

Create the Habitat task now.
