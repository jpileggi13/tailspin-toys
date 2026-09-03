---
description: 'Comment philosophy, documentation expectations, and TypeScript formatting rules'
applyTo: '**/*.{ts,astro}'
---

# Coding Standards: Comments, Documentation, and Formatting

This is the canonical home for how we comment and format code across the project.
Technology-specific rules live in their own instruction files and link back here:

- [`drizzle.instructions.md`](drizzle.instructions.md) — TSDoc/JSDoc requirements for
  exported functions in `db/` and `src/lib/`.
- [`astro.instructions.md`](astro.instructions.md) — documenting `.astro` component
  `Props` interfaces.

## Comment Philosophy: Why, Not What

- **Comment intent, not mechanics.** A comment should explain *why* code exists, the
  reasoning behind a non-obvious decision, or a trade-off/constraint that isn't visible
  from the code itself. Never write a comment that just restates the line(s) below it
  in English.
- If you find yourself writing a comment that only paraphrases the next line, delete
  the comment instead — the code already says it.

  ```ts
  // Bad — restates the code
  // Increment the counter
  counter += 1;

  // Good — explains why
  // Node's SQLite driver requires 1-based bind parameters, so shift the index.
  const bindIndex = index + 1;
  ```

- Prefer a short doc comment at the top of a module for *why the module is shaped
  this way* (see `db/transforms.ts` and `src/lib/ratings.ts` for examples), rather than
  scattering "what" comments through the body.
- Comments are appropriate for genuinely non-obvious logic (algorithms, workarounds for
  library quirks, platform-specific behavior) — see the CRLF handling comment in
  `db/transforms.ts` `parseCsv` as an example of a comment worth keeping.

## Keep Comments Current

Treat an outdated comment as a bug: if a change touches code that a comment describes,
update or delete that comment in the *same* change. Don't leave stale documentation for
a later cleanup pass.

## TypeScript Formatting

Formatting rules for the app's own TypeScript source (`db/`, `src/lib/`, `src/types/`,
and their test files):

- Single quotes for strings (`'like this'`), except to avoid escaping.
- Semicolons are required.
- 4-space indentation.
- Trailing commas on multiline literals, parameter lists, and imports.
- A final newline at the end of every file; no trailing whitespace.

These are enforced by ESLint (`@stylistic/eslint-plugin`) via `npm run lint` — see
`eslint.config.js`. The rules are scoped to `db/**/*.ts`, `src/lib/*.ts`, and
`src/types/*.ts`, which already follow this convention. Root-level tool configs
(`playwright.config.ts`, `vitest.config.ts`, `eslint.config.js`, etc.) and
`e2e-tests/*.spec.ts` follow their own generators' conventions and are out of scope for
these rules.

`.astro` frontmatter should follow the same conventions (single quotes, semicolons,
4-space indentation) by hand — see [`astro.instructions.md`](astro.instructions.md) for
component patterns.
