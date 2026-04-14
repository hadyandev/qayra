/** Matches @surah:ayah in note body (see qayra_full_deep_spec §9.5). */
export function extractVerseKeysFromContent(text: string): string[] {
  const re = /@(\d+:\d+)/g
  const keys = new Set<string>()
  for (const m of text.matchAll(re)) {
    keys.add(m[1])
  }
  return [...keys]
}
