import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export function renderCaseBody(markdown: string | undefined | null): string {
  if (!markdown) return '';
  return marked.parse(markdown, { async: false }) as string;
}
