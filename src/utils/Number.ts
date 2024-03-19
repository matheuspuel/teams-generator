import { pipe } from 'effect'

const thousandsSeparator = ',' as '.' | ','
const decimalSeparator = thousandsSeparator === '.' ? ',' : '.'

export const parseLocaleNumber = (stringNumber: string) =>
  stringNumber
    .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${decimalSeparator}`), '.')

const addThousandsSeparators = (numStr: string) =>
  pipe(
    numStr.indexOf(decimalSeparator),
    i => (i === -1 ? numStr.length : i),
    i => addThousandsSeparators_(i)(numStr),
  )
const addThousandsSeparators_ =
  (i: number) =>
  (s: string): string =>
    pipe(i - 3, i =>
      i < 1
        ? s
        : pipe(
            s.slice(0, i) + thousandsSeparator + s.slice(i, s.length),
            addThousandsSeparators_(i),
          ),
    )

const numStringToLocale = (numStr: string) =>
  pipe(
    decimalSeparator === ',' ? numStr.replace('.', ',') : numStr,
    addThousandsSeparators,
  )

export const toFixedLocale = (fractionDigits: number) => (value: number) =>
  pipe(value.toFixed(fractionDigits), numStringToLocale)

export const numberToLocaleString = (value: number) =>
  pipe(value.toString(), numStringToLocale)

export const formatPercentage = (value: number) =>
  numberToLocaleString(value * 100) + '%'

export const formatFixedPercentage =
  (fractionDigits: number) => (value: number) =>
    toFixedLocale(fractionDigits)(value * 100) + '%'
