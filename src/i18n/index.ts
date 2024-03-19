import { Option, ReadonlyArray, pipe } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
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
    ReadonlyArray.findFirst(l =>
      translations.some(t => t.languageCode === l.languageCode),
    ),
    Option.flatMap(l =>
      pipe(
        ReadonlyArray.findFirst(
          translations,
          t => t.languageCode === l.languageCode,
        ),
        Option.map(t => ({ translation: t, location: Option.some(l) })),
      ),
    ),
    Option.getOrElse(() => ({
      translation: translations[0],
      location: ReadonlyArray.head(locales),
    })),
    _ => ({ ..._, calendar: ReadonlyArray.head(calendars) }),
  )
}

export const preferences = getPreferences()

const translation = preferences.translation.translation

export const t = (token: keyof Translation) => translation[token]
