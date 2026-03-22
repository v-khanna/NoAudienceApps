# Fix #001: Drizzle sqlite-proxy Row Format Mismatch

**Date:** 2026-03-22
**Status:** Fixed
**Severity:** Critical — blocked ALL database operations on tables with JSON columns

## Symptom

```
Save failed: JSON Parse error: Unexpected identifier "undefined"
```

Every INSERT followed by a SELECT on tables with JSON columns (`films`, `film_logs`, `books`, `writings`, `chess_games`) crashed with this error. The app compiled fine but no data could be persisted.

## Previous Diagnosis (Wrong)

The session report (2026-03-23) blamed `tauri-plugin-sql` for returning `undefined` instead of `null` for NULL columns. Five fix attempts were made based on this assumption — all failed:

1. Sanitize params (undefined → null) — wrong target
2. Sanitize result rows (undefined → null via Object.entries) — addressed wrong problem
3. Double JSON.stringify — made things worse
4. Remove all .returning() calls — removed 28 occurrences, didn't fix root cause
5. Raw SQL bypass — correct direction but was reverted before testing

## Actual Root Cause

**Row format mismatch between tauri-plugin-sql and Drizzle ORM.**

The data flow:
```
SQLite → tauri-plugin-sql (Rust) → Tauri IPC → JavaScript → Drizzle sqlite-proxy
```

- **tauri-plugin-sql** returns rows as **objects**: `{id: 1, title: "Movie", genres: "[]"}`
- **Drizzle's `mapResultRow`** (in `utils.js:29`) accesses rows by **numeric index**: `row[columnIndex]`
- `object[0]` → `undefined` for every column
- Non-JSON columns silently received `undefined` (no visible error)
- JSON columns crashed: `JSON.parse(undefined)` → `JSON.parse("undefined")` → SyntaxError

### Evidence

1. **Rust source** (`tauri-plugin-sql/src/decode/sqlite.rs`): NULL values are explicitly serialized as `JsonValue::Null` (line 12-13), never as `undefined`. The `select` command returns `Vec<IndexMap<String, JsonValue>>` — objects with all keys present.

2. **Drizzle source** (`drizzle-orm/utils.js:29`): `const rawValue = row[columnIndex]` — expects positional arrays.

3. **Bridge code** (`db.ts`): Was passing objects straight through to Drizzle.

## Fix

One line change in `apps/noaudience/src/lib/db.ts`:

```typescript
// Before (broken):
const rawRows = await tauriDb.select(sql, params);
return sanitizeRows(rawRows); // Returns objects — wrong format

// After (fixed):
const rawRows = await tauriDb.select(sql, params);
return rawRows.map(row => Object.values(row)); // Returns arrays — correct format
```

`Object.values()` preserves insertion order, which matches SQL column order because the Rust side uses `IndexMap` (ordered map).

## Why Previous Fixes Failed

All five attempts targeted the **values** in the rows (converting undefined to null, changing JSON handling). The actual problem was the **format** of the rows (objects vs arrays). No amount of value sanitization could fix a structural mismatch.

## Lessons

1. Read the actual source code of dependencies, not just their docs
2. Trace the full data path when debugging serialization issues
3. When 3+ fixes fail, question the diagnosis, not just try another fix
4. The Rust source (`decode/sqlite.rs`, `commands.rs`) and Drizzle source (`utils.js`, `session.js`) were both readable and definitive
