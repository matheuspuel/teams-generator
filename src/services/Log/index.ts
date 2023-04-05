import { $, IO, Rec } from 'fp'
import { Timestamp } from 'src/utils/datatypes'

export const LogLevelDict = {
  trace: null,
  debug: null,
  info: null,
  warn: null,
  error: null,
  fatal: null,
}

export type LogLevel = keyof typeof LogLevelDict

export type LogData = {
  level: LogLevel
  category: string
  timestamp: Timestamp
  message: string
  context: object | null
}

export type Logger = (data: LogData) => IO<void>

export type LoggerEnv = { logger: Logger }

const toApiLogger =
  (level: LogLevel) =>
  (timestamp: Timestamp) =>
  (category: string) =>
  (message: string) =>
  (context: object | null) =>
  (env: LoggerEnv): IO<void> =>
    $(env.logger({ level, category, message, context, timestamp }))

const toApiCurrentTimeLogger =
  (level: LogLevel) =>
  (category: string) =>
  (message: string) =>
  (context: object | null) =>
  (env: LoggerEnv): IO<void> =>
    $(
      Timestamp.getNow,
      IO.chain(timestamp =>
        env.logger({ level, category, message, context, timestamp }),
      ),
    )

export const Log: Record<
  LogLevel,
  ReturnType<typeof toApiCurrentTimeLogger>
> & {
  withTime: Record<LogLevel, ReturnType<typeof toApiLogger>>
} = $(LogLevelDict, Rec.mapWithIndex(toApiCurrentTimeLogger), o => ({
  ...o,
  withTime: $(LogLevelDict, Rec.mapWithIndex(toApiLogger)),
}))
