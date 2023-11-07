import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { getCalendars, getLocales } from 'expo-localization'
import { A, O, pipe } from 'fp'
import { enTranslation } from './translations/en'
import { ptTranslation } from './translations/pt'

export type Translation = typeof enTranslation

const translations: NonEmptyReadonlyArray<{
  languageCode: string
  regionCode: string
  translation: Translation
}> = [
  { languageCode: 'en', regionCode: 'GB', translation: enTranslation },
  { languageCode: 'pt', regionCode: 'BR', translation: ptTranslation },
]

const getPreferences = () => {
  const locales = getLocales()
  const calendars = getCalendars()
  return pipe(
    locales,
    A.findFirst(l => translations.some(t => t.languageCode === l.languageCode)),
    O.flatMap(l =>
      pipe(
        A.findFirst(translations, t => t.languageCode === l.languageCode),
        O.map(t => ({ translation: t, location: O.some(l) })),
      ),
    ),
    O.getOrElse(() => ({
      translation: translations[0],
      location: A.head(locales),
    })),
    _ => ({ ..._, calendar: A.head(calendars) }),
  )
}

const preferences = getPreferences()

const translationsEnabled = false

const translation = translationsEnabled
  ? preferences.translation.translation
  : ptTranslation

export const t = (token: keyof Translation) => translation[token]
