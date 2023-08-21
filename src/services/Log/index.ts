import * as Context from '@effect/data/Context'
import { $, F, Effect, Rec } from 'fp'
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

export type Logger = (data: LogData) => Effect<never, never, void>

export type LoggerEnv = { logger: Logger }

export const LoggerEnv = Context.Tag<LoggerEnv>()

const toApiLogger =
  (level: LogLevel) =>
  (timestamp: Timestamp) =>
  (category: string) =>
  (message: string) =>
  (context: object | null): Effect<LoggerEnv, never, void> =>
    F.flatMap(LoggerEnv, env =>
      env.logger({ level, category, message, context, timestamp }),
    )

const toApiCurrentTimeLogger =
  (level: LogLevel) =>
  (category: string) =>
  (message: string) =>
  (context: object | null): Effect<LoggerEnv, never, void> =>
    $(
      Timestamp.getNow,
      F.flatMap(timestamp =>
        F.flatMap(LoggerEnv, env =>
          env.logger({ level, category, message, context, timestamp }),
        ),
      ),
    )

export const Log: Record<
  LogLevel,
  ReturnType<typeof toApiCurrentTimeLogger>
> & {
  withTime: Record<LogLevel, ReturnType<typeof toApiLogger>>
} = $(
  LogLevelDict,
  Rec.map((_, k) => toApiCurrentTimeLogger(k)),
  o => ({
    ...o,
    withTime: $(
      LogLevelDict,
      Rec.map((_, k) => toApiLogger(k)),
    ),
  }),
)
