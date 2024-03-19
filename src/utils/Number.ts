import { pipe } from 'effect'

const thousandsSeparator = ',' as '.' | ','
const decimalSeparator = thousandsSeparator === '.' ? ',' : '.'

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

// TODO reimplement using localization
export const toFixedLocale = (fractionDigits: number) => (value: number) =>
  pipe(value.toFixed(fractionDigits), numStringToLocale)
