export function extractVerseKeysFromContent(text: string): string[] {
  const re = /@(\d+:\d+)/g
  const keys = new Set<string>()
  for (const m of text.matchAll(re)) {
    keys.add(m[1])
  }
  return [...keys]
}
