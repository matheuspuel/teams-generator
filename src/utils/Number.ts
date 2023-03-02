import { $, A, Monoid, Num } from 'fp'

export const div = (divisor: number) => (dividend: number) => dividend / divisor

export const avg = (ns: Array<number>) =>
  $(ns, Monoid.concatAll(Num.MonoidSum), div(A.size(ns)))

const thousandsSeparator = '.' as '.' | ','
const decimalSeparator = thousandsSeparator === '.' ? ',' : '.'

export const parseLocaleNumber = (stringNumber: string) =>
  stringNumber
    .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${decimalSeparator}`), '.')

const addThousandsSeparators = (numStr: string) =>
  $(
    numStr.indexOf(decimalSeparator),
    i => (i === -1 ? numStr.length : i),
    i => addThousandsSeparators_(i)(numStr),
  )
const addThousandsSeparators_ =
  (i: number) =>
  (s: string): string =>
    $(i - 3, i =>
      i < 1
        ? s
        : $(
            s.slice(0, i) + thousandsSeparator + s.slice(i, s.length),
            addThousandsSeparators_(i),
          ),
    )

const numStringToLocale = (numStr: string) =>
  $(
    decimalSeparator === ',' ? numStr.replace('.', ',') : numStr,
    addThousandsSeparators,
  )

export const toFixedLocale = (fractionDigits: number) => (value: number) =>
  $(value.toFixed(fractionDigits), numStringToLocale)

export const numberToLocaleString = (value: number) =>
  $(value.toString(), numStringToLocale)

export const formatPercentage = (value: number) =>
  numberToLocaleString(value * 100) + '%'

export const formatFixedPercentage =
  (fractionDigits: number) => (value: number) =>
    toFixedLocale(fractionDigits)(value * 100) + '%'
