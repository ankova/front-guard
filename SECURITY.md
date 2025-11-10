
### `SECURITY.md`

```md
# Security Policy

If you discover a security vulnerability:

- Please **do not** open a public GitHub issue.
- Email: security@example.com
- We will acknowledge within a reasonable time and work on a fix.

`sanitizeHtml` is intentionally minimal. For rich HTML sanitization, integrate a
dedicated sanitizer (e.g. DOMPurify) using `safeUrl` / `escapeHtml` where needed.
