import { Array, Option, pipe } from 'effect'
import type { NonEmptyReadonlyArray } from 'effect/Array'
import { getCalendars, getLocales } from 'expo-localization'
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
    Array.findFirst(l =>
      translations.some(t => t.languageCode === l.languageCode),
    ),
    Option.flatMap(l =>
      pipe(
        Array.findFirst(translations, t => t.languageCode === l.languageCode),
        Option.map(t => ({ translation: t, location: l })),
      ),
    ),
    Option.getOrElse(() => ({
      translation: translations[0],
      location: locales[0],
    })),
    _ => ({ ..._, calendar: Array.head(calendars) }),
  )
}

export const localePreferences = getPreferences()

export const locale = localePreferences.location.languageTag

const translation = localePreferences.translation.translation

export type TranslationFunction = typeof t
export const t = (token: keyof Translation) => translation[token]
