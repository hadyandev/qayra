
export const useQuran = () => {
  const config = useRuntimeConfig()

  const search = async (q) => {
    return await $fetch(`${config.public.qfBase}/search`, { params: { q } })
  }

  const verse = async (key) => {
    return await $fetch(`${config.public.qfBase}/verses/by_key/${key}`)
  }

  return { search, verse }
}
