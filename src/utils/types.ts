export type DeepMutable<T> = T extends
  ((...args: Array<any>) => any) | number | string | boolean | null | undefined
  ? T
  : T extends Record<keyof any, any>
    ? {
        -readonly [K in keyof T]: DeepMutable<T[K]>
      }
    : T
