export type DeepMutable<T> = T extends
  | // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((...args: Array<any>) => any)
  | number
  | string
  | boolean
  | null
  | undefined
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Record<keyof any, any>
    ? {
        -readonly [K in keyof T]: DeepMutable<T[K]>
      }
    : T
