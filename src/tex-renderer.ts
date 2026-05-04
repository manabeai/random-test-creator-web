import katex from 'katex';

/**
 * Render input TeX (display math) to HTML.
 * Input TeX is wrapped in \[...\] — strip delimiters for KaTeX displayMode.
 */
export function renderInputTex(tex: string): string {
  if (!tex.trim()) return '';
  let content = tex.trim();
  if (content.startsWith('\\[')) content = content.slice(2);
  if (content.endsWith('\\]')) content = content.slice(0, -2);
  content = content.trim();
  if (!content) return '';

  try {
    return katex.renderToString(content, { displayMode: true, throwOnError: false });
  } catch {
    return `<pre class="tex-fallback">${escapeHtml(tex)}</pre>`;
  }
}

/**
 * Render constraint TeX to HTML.
 * Constraint TeX uses \begin{itemize}\item $...$\end{itemize}.
 * Parse \item lines, render $...$ with KaTeX inline.
 */
export function renderConstraintsTex(tex: string): string {
  if (!tex.trim()) return '';

  const itemRegex = /\\item\s+(.+)/g;
  const items: string[] = [];
  let match;
  while ((match = itemRegex.exec(tex)) !== null) {
    items.push(match[1].trim());
  }

  if (items.length === 0) {
    return `<pre class="tex-fallback">${escapeHtml(tex)}</pre>`;
  }

  const rendered = items.map((item) => {
    const html = item.replace(/\$([^$]+)\$/g, (_, math: string) => {
      try {
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      } catch {
        return `<code>$${escapeHtml(math)}$</code>`;
      }
    });
    return `<li>${html}</li>`;
  });

  return `<ul class="constraint-tex-list">${rendered.join('\n')}</ul>`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
