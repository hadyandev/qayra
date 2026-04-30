export interface Topic {
  slug: string
  name: string
  description: string
  icon: string
  color: string
  verses: string[]
}

export const quranTopics: Topic[] = [
  {
    slug: 'faith',
    name: 'Faith & Belief',
    description: 'Verses about faith in Allah, belief, and trust',
    icon: 'i-heroicons-sparkles',
    color: 'amber',
    verses: [
      '2:256', '3:18', '4:136', '6:1', '14:1', '21:30', '24:35', '51:56', '67:1', '112:1-4'
    ]
  },
  {
    slug: 'prayer',
    name: 'Prayer & Worship',
    description: 'Verses about prayer, salah, and worship',
    icon: 'i-heroicons-hand-raised',
    color: 'blue',
    verses: [
      '2:45', '2:83', '2:125', '2:153', '2:177', '4:162', '11:114', '17:78', '23:118', '29:45'
    ]
  },
  {
    slug: 'patience',
    name: 'Patience & Perseverance',
    description: 'Verses about patience during difficulties',
    icon: 'i-heroicons-clock',
    color: 'teal',
    verses: [
      '2:45', '2:153', '3:200', '8:46', '16:127', '21:83', '25:20', '31:17', '42:43', '70:5'
    ]
  },
  {
    slug: 'mercy',
    name: 'Mercy & Compassion',
    description: 'Verses about Allah\'s mercy and showing compassion',
    icon: 'i-heroicons-heart',
    color: 'rose',
    verses: [
      '1:1', '2:54', '2:178', '3:31', '6:12', '6:54', '7:56', '21:107', '39:53', '82:14'
    ]
  },
  {
    slug: 'charity',
    name: 'Charity & Giving',
    description: 'Verses about zakah, charity, and generosity',
    icon: 'i-heroicons-gift',
    color: 'emerald',
    verses: [
      '2:110', '2:195', '2:215', '2:254', '3:92', '4:36', '9:60', '17:26', '30:38', '57:18'
    ]
  },
  {
    slug: 'family',
    name: 'Family & Relations',
    description: 'Verses about family, parents, and relationships',
    icon: 'i-heroicons-users',
    color: 'violet',
    verses: [
      '2:83', '2:215', '4:1', '4:9', '4:19', '6:151', '17:23', '31:14', '46:15', '58:22'
    ]
  },
  {
    slug: 'knowledge',
    name: 'Knowledge & Wisdom',
    description: 'Verses about seeking knowledge and wisdom',
    icon: 'i-heroicons-academic-cap',
    color: 'indigo',
    verses: [
      '2:151', '3:18', '9:122', '12:22', '20:114', '35:28', '39:9', '58:11', '67:10', '96:1-5'
    ]
  },
  {
    slug: 'guidance',
    name: 'Guidance & Light',
    description: 'Verses about divine guidance and enlightenment',
    icon: 'i-heroicons-light-bulb',
    color: 'yellow',
    verses: [
      '2:35', '2:257', '5:44', '7:154', '14:1', '24:35', '33:43', '42:52', '71:16', '76:1'
    ]
  },
  {
    slug: 'paradise',
    name: 'Paradise & Jannah',
    description: 'Verses about paradise and eternal reward',
    icon: 'i-heroicons-star',
    color: 'green',
    verses: [
      '2:25', '3:133', '9:72', '13:35', '15:45-48', '47:15', '55:46-78', '56:12-40', '76:5-21', '84:25'
    ]
  },
  {
    slug: 'creation',
    name: 'Creation & Signs',
    description: 'Verses about the creation and signs of Allah',
    icon: 'i-heroicons-globe-alt',
    color: 'cyan',
    verses: [
      '2:164', '3:190', '6:95-99', '7:54', '10:5', '21:16', '23:115', '24:45', '36:38-40', '67:1-5'
    ]
  }
]

export function getTopicBySlug(slug: string): Topic | undefined {
  return quranTopics.find(t => t.slug === slug)
}

export function getTopicByVerseKey(verseKey: string): Topic | undefined {
  return quranTopics.find(t => t.verses.includes(verseKey))
}
