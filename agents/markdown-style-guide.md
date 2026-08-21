# Markdown Style Guide

This document is a style guide for Markdown. It describes recommended writing and formatting rules for documents created with Markdown.

## Markdown Scope

- Use GitHub Flavored Markdown (GFM) as the baseline.
- Refer to the [GitHub Flavored Markdown Spec](https://github.github.com/gfm/) for the GFM specification.

## Headings

- Use ATX-style headings. Indicate the heading level with the number of `#` characters.

```markdown
# Heading 1

## Heading 2

### Heading 3
```

- Insert one blank line after each heading.
- Use heading levels sequentially without skipping levels. For example, do not use `###` immediately after `#`.
- Do not write headings as sentences or add punctuation.
- Keep headings concise, unique, and complete.
- Design heading levels as follows:
  - Use level 1 (`#`) for the document title. Use it only once in each document.
  - Use level 2 (`##`) for major sections, equivalent to chapters.
  - Use level 3 (`###`) for subsections.
  - Use level 4 (`####`) for smaller sections, only when necessary.
  - Avoid levels 5 and 6 in general. If you need to use them, reconsider the document structure.

## Text Formatting

- Use emphasis sparingly.
- Do not use bold text instead of headings. Use heading syntax such as `##` to divide sections.
- Use italics sparingly in Japanese-language documents.
- Use asterisks consistently for bold and italic text; do not use underscores.

## Lists

- Use hyphens (`-`) for list markers. Do not use plus signs (`+`) or asterisks (`*`).
- Insert a blank line before and after each list.
- Use spaces for indentation.
- Align continuation lines in a list with the start of the list text.
- Use a consistent sentence or phrase style within the same list.
- Limit nesting to two levels, or three levels at most. If deeper nesting is required, divide the content into sections or reconsider the structure.

## Links

- Use descriptive link text. Use text such as “official documentation” rather than vague text such as “here.”
- If the same URL is repeated, use reference-style links. This centralizes URL management and makes future changes easier.

  ```markdown
  [Node.js][nodejs] and [Python][python] are required for the environment setup.
  Use [webpack][webpack] as the build tool.
  [nodejs]: https://nodejs.org/
  [python]: https://www.python.org/
  [webpack]: https://webpack.js.org/
  ```

## Images

- Write concise, descriptive alternative text that explains the image content.
- Use an empty alternative text string for decorative images.
- Specify project images with relative paths such as `images/fig1.png` to make the repository easier to move.
- Use descriptive file names. Use `login-screen.png` rather than `image1.png` so that the file's content is clear.
- Be mindful of image dimensions because oversized images slow page loading.

## Block Quotes

- Add one space after the block quote marker (`>`).
- Insert a blank line before and after each block quote.
- Limit nesting to two levels, or three levels at most. If deeper nesting is required, reconsider the structure.

## Code Blocks

- Use fenced code blocks (```) rather than indented code blocks (4 spaces).
- Insert a blank line before and after each code block.
- Avoid unnecessary inline code. Do not enclose proper nouns merely for the sake of doing so, as on GitHub; use inline code when showing commands or code, such as `git push`.
- Specify a language for fenced code blocks.

  ````markdown
  ```python
  def hello():
      print("Hello, World!")
  ```
  ````

- If a code block contains ```, use a four-backtick fence (````) for the outer fence.

- Use diff-format code blocks where appropriate.

  ```diff
  - old line
  + new line
  ```

## Tables

- The leading and trailing `|` characters may be omitted, but include them consistently.
- Align the number of columns. Do not omit `|` characters even in empty cells.
- Insert a blank line before and after each table.
- If a table becomes too large, split it into multiple tables.

## Horizontal Rules

- Use `---` for horizontal rules.
- Insert a blank line before and after each horizontal rule.
- Avoid overusing horizontal rules.

## Paragraphs and Line Breaks

- Use a backslash for a hard line break when you need a line break without starting a new paragraph, such as in an address or signature block.
- Use a blank line, not a hard line break, to separate paragraphs.
- Do not insert consecutive blank lines. One blank line is sufficient; adding two or more does not change the spacing between paragraphs.
