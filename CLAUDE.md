# Inflation Gambler - AI Agent Guidelines

## Critical Rules

### ALWAYS
- Write tests BEFORE implementation (TDD)
- Create Storybook tests for UI components
- Run before ANY commit: `npm run lint && npm run typecheck && npm run test`
- Use TypeScript strict mode

## Architecture

### Directory Structure
```
src/
- domains/
-- counter/
--- counter.types.ts		# Type definitions
--- counter.utils.ts		# Pure functions
--- counter.utils.test.ts
--- counter.view.tsx		# UI component
--- counter.view.test.tsx
--- counter.store.ts		# State and actions (using Zustand)
--- counter.store.test.ts
--- counter.hook.ts		# Custom hook to connect view and store
--- counter.hook.test.ts
--- counter.module.css		# CSS modules for styling
--- counter.stories.tsx	# Storybook stories
- shared/			# Global shared elements
- App.tsx
```

### Test File Organization
- **Colocation**: Test files (`.test.ts`, `.test.tsx`) must be placed in the same directory as the code they test
- Example: `src/domains/counter/counter.view.test.tsx` for `src/domains/counter/counter.view.tsx`
- `tests/` directory is only for integration tests and test utilities

### Naming Conventions

#### PascalCase
- Type names defined with the type keyword

#### camelCase
- Variable names
- Function names
- File names

#### CONSTANT_CASE
- Constant values

### File Suffix Rules
Always use appropriate suffixes to clarify file responsibilities:
- `.view.tsx` - View layer components (UI only, no business logic)
- `.hook.ts` - Custom hooks serving as interfaces to store-managed state and logic orchestration (including single `useX` hooks)
- `.service.ts` - API services and external integrations
- `.store.ts` - State containers (e.g., Zustand) where actual state and mutation logic are defined
- `.type.ts` - Type definitions
- `.utils.ts` - Pure utility functions (no side effects)
- `.stories.tsx` - Storybook stories
- `.test.ts(x)` - Test files
- `.module.css` - CSS Modules

## Code Navigation and Editing with Serena MCP

### ALWAYS use Serena MCP for efficient code exploration
- Use `find_symbol` and `get_symbols_overview` instead of reading entire files
- Navigate code by symbols (functions, classes, methods) rather than line-by-line reading
- Only read symbol bodies when necessary for the task

### Symbol-based editing approach
- Use `replace_symbol_body` for modifying entire functions/classes
- Use `insert_before_symbol` for adding imports at file start
- Use `insert_after_symbol` for adding new code after existing symbols
- Use `find_referencing_symbols` to check dependencies before breaking changes

### Regex-based editing for precise changes
- Use `replace_regex` for small, targeted modifications within symbols
- Utilize wildcards (.*?) for efficient pattern matching
- Avoid reading entire files just to make small edits

### Best practices
- Search for symbols first, then read only what's needed
- Use memory files to store and recall project-specific knowledge
- Batch related operations for efficiency