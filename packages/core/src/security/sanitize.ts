const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (input: string): string =>
  input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);

/**
 * Very conservative URL check. Only allows http/https.
 */
export const safeUrl = (url: string): string | null => {
  try {
    const u = new URL(url, 'http://localhost');
    const protocol = u.protocol.toLowerCase();
    if (protocol === 'http:' || protocol === 'https:') return url;
    return null;
  } catch {
    return null;
  }
};

/**
 * Minimal HTML sanitizer for untrusted content.
 * Escapes all HTML. For rich HTML, use a dedicated sanitizer.
 */
export const sanitizeHtml = (html: string): string => escapeHtml(html);
