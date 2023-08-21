import { $, F, absurd, constVoid } from 'fp'
import * as Metadata from 'src/utils/Metadata'
import { Timestamp } from 'src/utils/datatypes'
import { LogData, LogLevel, Logger } from '.'

const productionLevels: Record<LogLevel, boolean> = {
  trace: false,
  debug: false,
  info: true,
  warn: true,
  error: true,
  fatal: true,
}
const developmentLevels: Record<LogLevel, boolean> = {
  trace: true,
  debug: true,
  info: true,
  warn: true,
  error: true,
  fatal: true,
}
const enabledLevels =
  Metadata.envName === 'development' ? developmentLevels : productionLevels

const formatTime = (t: Timestamp): string => {
  const date = new Date(t)
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const buildDefaultMessage = ({
  level: _level,
  category,
  timestamp: time,
  message,
  context,
}: LogData): string =>
  `${formatTime(time)} ${category}: ${message}` +
  (context === null ? '' : ': ' + JSON.stringify(context, undefined, 2))

const defaultMessageLogger: Logger = args =>
  F.sync(
    enabledLevels[args.level]
      ? $(buildDefaultMessage(args), t =>
          args.level === 'debug'
            ? () => console.debug(t)
            : args.level === 'error'
            ? () => console.error(t)
            : args.level === 'fatal'
            ? () => console.error('FATAL ' + t)
            : args.level === 'info'
            ? () => console.info(t)
            : args.level === 'trace'
            ? () => console.debug(t)
            : args.level === 'warn'
            ? () => console.warn(t)
            : absurd<never>(args.level),
        )
      : () => constVoid,
  )

export const defaultLogger: Logger = defaultMessageLogger

const getTrace =
  (logger: Logger) =>
  (prefix: string) =>
  <A>(value: A): A =>
    $(
      Timestamp.getNow,
      F.flatMap(now =>
        typeof value === 'object' && value !== null
          ? logger({
              level: 'trace',
              category: 'TRACE',
              message: prefix,
              context: value,
              timestamp: now,
            })
          : logger({
              level: 'trace',
              category: 'TRACE',
              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              message: `${prefix}: ${value + ''}`,
              context: null,
              timestamp: now,
            }),
      ),
      F.map(() => value),
      F.runSync,
    )

const getTraceMessage =
  (logger: Logger) =>
  (message: string) =>
  <A>(value: A): A =>
    $(
      Timestamp.getNow,
      F.flatMap(now =>
        logger({
          level: 'trace',
          category: 'TRACE',
          message: message,
          context: null,
          timestamp: now,
        }),
      ),
      F.map(() => value),
      F.runSync,
    )

export const trace = getTrace(defaultLogger)

export const traceMsg = getTraceMessage(defaultLogger)
