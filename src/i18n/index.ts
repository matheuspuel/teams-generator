import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { getCalendars, getLocales } from 'expo-localization'
import { A, O, pipe } from 'fp'
import { enTranslations } from './translations/en'
import { ptTranslations } from './translations/pt'

export type Translation = typeof enTranslations

const translations: NonEmptyReadonlyArray<{
  languageCode: string
  regionCode: string
  translation: Translation
}> = [
  { languageCode: 'en', regionCode: 'GB', translation: enTranslations },
  { languageCode: 'pt', regionCode: 'BR', translation: ptTranslations },
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

const translation = preferences.translation.translation

export const t = (token: keyof Translation) => translation[token]
