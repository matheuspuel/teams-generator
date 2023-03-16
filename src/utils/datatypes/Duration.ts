import { flow as $f, pipe as $ } from 'fp-ts/function'

export type Duration = number

export const millisecond: Duration = 1

export const toMilliseconds = (duration: Duration) => duration / millisecond

export const milliseconds = (milliseconds: number): Duration =>
  milliseconds * millisecond

export const second: Duration = $(1000, milliseconds)

export const toSeconds = (duration: Duration) => duration / second

export const seconds = (seconds: number): Duration => seconds * second

export const minute: Duration = $(60, seconds)

export const toMinutes = (duration: Duration) => duration / minute

export const minutes = (minutes: number): Duration => minutes * minute

export const hour: Duration = $(60, minutes)

export const toHours = (duration: Duration) => duration / hour

export const hours = (hours: number): Duration => hours * hour

export const day: Duration = $(24, hours)

export const toDays = (duration: Duration) => duration / day

export const days = (days: number): Duration => days * day

export const add: (b: Duration) => (a: Duration) => Duration = a => b => a + b

export const addSeconds = $f(seconds, add)

export const decrementSecond = addSeconds(-1)

export const incrementSecond = addSeconds(1)
