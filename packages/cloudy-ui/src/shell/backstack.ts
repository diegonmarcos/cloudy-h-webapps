// Back (the top row's arrow, ShellToolbarRow onBack -> goBack): page -> its section's first tab -> Home -> nothing.
// Paths are site-relative ('' = home, 'cloud/', 'cloud/lnktree/'). The browser's own Back walks history and is never trapped.
export type SectionLike = { id: string; pages?: { id: string; hidden?: boolean }[] };

export function backTarget(path: string, sections: SectionLike[]): string | null {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  const sec = sections.find((s) => s.id === parts[0]);
  if (!sec) return '';
  if (parts.length === 1) return '';
  const first = (sec.pages ?? []).find((p) => !p.hidden)?.id;
  if (parts.length > 2) return `${parts[0]}/${parts[1]}/`;
  if (first && parts[1] !== first) return `${parts[0]}/${first}/`;
  return '';
}
