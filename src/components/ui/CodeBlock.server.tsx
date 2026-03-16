import * as React from "react";

export async function CodeBlockServer({ code, language }: { code: string; language?: string }) {
  try {
    const shiki = await import("shiki");
    const highlighter = await (shiki as any).createHighlighter({ theme: "vasper" as any });
    const html = (highlighter as any).codeToHtml(code, { lang: language ?? "tsx" } as any);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (e) {
    // Fallback: render plain preformatted code if shiki fails at runtime (SSR prerender safety)
    return (
      <pre style={{ padding: 12, background: '#111', color: '#fff', overflowX: 'auto' }}>
        <code>{code}</code>
      </pre>
    );
  }
}
