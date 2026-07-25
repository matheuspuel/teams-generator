import type {
  getCalendars as getCalendars_,
  getLocales as getLocales_,
} from 'expo-localization'

export const getLocales: typeof getLocales_ = () => [
  {
    currencyCode: 'USD',
    currencySymbol: '$',
    decimalSeparator: '.',
    digitGroupingSeparator: ',',
    languageCode: 'en',
    languageCurrencyCode: 'USD',
    languageCurrencySymbol: '$',
    languageRegionCode: 'US',
    languageScriptCode: null,
    languageTag: 'en-US',
    measurementSystem: 'us',
    regionCode: 'US',
    temperatureUnit: 'fahrenheit',
    textDirection: 'ltr',
  },
  {
    currencyCode: 'BRL',
    currencySymbol: 'R$',
    decimalSeparator: ',',
    digitGroupingSeparator: '.',
    languageCode: 'pt',
    languageCurrencyCode: 'BRL',
    languageCurrencySymbol: 'R$',
    languageRegionCode: 'BR',
    languageScriptCode: null,
    languageTag: 'pt-BR',
    measurementSystem: 'metric',
    regionCode: 'BR',
    temperatureUnit: 'celsius',
    textDirection: 'ltr',
  },
]

export const getCalendars: typeof getCalendars_ = () => [] as any
