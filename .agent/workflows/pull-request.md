---
description: follow strict pull request authoring guidelines
---

Whenever you create a pull request, follow this mandatory Markdown format:

```markdown
## Summary
<!-- What was changed and why (1–2 sentences) -->

## Background
<!-- Why this change is needed, context, and related issues/incidents -->

## Changes
- (Code) Modified or added files/functions
- (Config) Added or changed configuration keys
- (Test) Added or updated tests

## Implementation Notes
<!-- Implementation approach, design decisions, trade-offs, and constraints -->

## Impact & Risks
<!-- Describe potential impact, backward compatibility, and risks -->

## Related (optional)
- Issue: #...
- Docs: path/to/doc
```

**Rules:**
1. **Strict format compliance**: Use exact headings. Do not add or remove sections.
2. **Conciseness**: Keep each section ≤ 5 lines preferred. Use bullet points.
3. **Clean output**: Remove all `<!-- ... -->` comment lines.
4. **Consistency**: Summary and Background must align.
