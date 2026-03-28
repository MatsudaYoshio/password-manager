# TypeScript Configuration & Nuances

This project runs strict TypeScript. By enforcing robust typing, we catch errors at compile-time rather than run-time.

## The Rule of `any`

- **Never use `any`.** 
- If you absolutely do not know the type, use `unknown` and perform type narrowing. 
- When an external library lacks types (and `@types/` doesn't exist), you can declare an interface for it. But strictly speaking, our dependencies generally have types mapped.

## Strict Null Checks

- **Non-null assertions (`!`)**: Avoid using the non-null assertion operator unless absolutely necessary (e.g., in a test setup where you've explicitly created the mock data).
- In application code, handle nulls and undefined cases appropriately using optional chaining (`?.`) or explicit conditional guards. 
- Example: 
  - **Bad**: `const name = user!.profile!.name;`
  - **Good**: `const name = user?.profile?.name ?? 'Unknown';`

## Types vs Interfaces

- Use `interface` by default when declaring the shape of an object or React Props. 
- Interfaces are easily extendable via declaration merging.
- Use `type` for unions (e.g., `type Status = 'active' | 'inactive';`), mapped types, or complex conditional types.

## Enums vs Union Types

- Prefer **Union Types** for string literals. Enums in TypeScript generate a lot of additional IIFE code in the transpiled output and can sometimes cause awkward inverse-mapping behaviour.
- Example: 
  - **Bad**: `enum LogLevel { INFO, WARN, ERROR }`
  - **Good**: `type LogLevel = 'info' | 'warn' | 'error';`

## Shared Types

- For types that represent domain logic spanning both the main and renderer processes (like IPC payloads or Database entries), define them in `src/shared/types/`. 
- This ensures type-safety across the IPC barrier.
