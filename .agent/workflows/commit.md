---
description: follow strict commit message guidelines
---

Whenever you perform a git commit, follow these mandatory rules:

1. **Output language:** The entire output **must be written in English**.
2. **First line format (Conventional Commits):** `<type>(<scope>)?: <subject>`
   - Types: **feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert**
   - Subject: **within 50 characters**.
3. **Detailed description (after the title):** 
   - Insert one **blank line** between the title and the body.
   - Each line must be **within 72 characters**.
   - List modifications per file: `- {filename}: {change description}`

Example:
```
feat: Add password confirmation field to the user registration form

- UserRegisterForm: Added password confirmation input field
- validation/UserValidator: Implemented confirmation field match check
- user_register.html: Added new input field
```
