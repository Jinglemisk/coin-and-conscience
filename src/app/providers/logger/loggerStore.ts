import { create } from 'zustand';
import type { LogEvent, LogLevel, LoggerOptions } from './loggerTypes';

interface LoggerState {
  options: Required<Pick<LoggerOptions, 'enableBuffer' | 'maxBufferSize'>> & {
    defaultTags: readonly string[];
  };
  buffer: LogEvent[];
  configure: (options: LoggerOptions) => void;
  clearBuffer: () => void;
  log: (level: LogLevel, message: string, context?: Record<string, unknown>, tags?: readonly string[]) => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const emitToConsole = (event: LogEvent) => {
  const { level, message, context, tags, timestamp } = event;
  const payload = { timestamp, tags, context };
  const formattedMessage = `[${level.toUpperCase()}] ${message}`;
  switch (level) {
    case 'debug':
      console.debug(formattedMessage, payload);
      break;
    case 'info':
      console.info(formattedMessage, payload);
      break;
    case 'warn':
      console.warn(formattedMessage, payload);
      break;
    case 'error':
    default:
      console.error(formattedMessage, payload);
      break;
  }
};

const createEvent = (
  level: LogLevel,
  message: string,
  context: Record<string, unknown> | undefined,
  tags: readonly string[] | undefined,
  defaultTags: readonly string[]
): LogEvent => ({
  id: generateId(),
  level,
  message,
  context,
  tags: tags ?? defaultTags,
  timestamp: Date.now()
});

const DEFAULT_OPTIONS = {
  enableBuffer: true,
  maxBufferSize: 200,
  defaultTags: [] as const
};

export const useLoggerStore = create<LoggerState>((set, get) => ({
  options: DEFAULT_OPTIONS,
  buffer: [],
  configure: (options) => {
    set((state) => ({
      options: {
        enableBuffer: options.enableBuffer ?? state.options.enableBuffer,
        maxBufferSize: options.maxBufferSize ?? state.options.maxBufferSize,
        defaultTags: options.defaultTags ?? state.options.defaultTags
      }
    }));
  },
  clearBuffer: () => set({ buffer: [] }),
  log: (level, message, context, tags) => {
    const { options } = get();
    const event = createEvent(level, message, context, tags, options.defaultTags);
    emitToConsole(event);

    if (!options.enableBuffer) {
      return;
    }

    set((state) => {
      const nextBuffer = [...state.buffer, event];
      if (nextBuffer.length > options.maxBufferSize) {
        nextBuffer.splice(0, nextBuffer.length - options.maxBufferSize);
      }
      return { buffer: nextBuffer };
    });
  }
}));

export const logDebug = (message: string, context?: Record<string, unknown>, tags?: readonly string[]) =>
  useLoggerStore.getState().log('debug', message, context, tags);

export const logInfo = (message: string, context?: Record<string, unknown>, tags?: readonly string[]) =>
  useLoggerStore.getState().log('info', message, context, tags);

export const logWarn = (message: string, context?: Record<string, unknown>, tags?: readonly string[]) =>
  useLoggerStore.getState().log('warn', message, context, tags);

export const logError = (message: string, context?: Record<string, unknown>, tags?: readonly string[]) =>
  useLoggerStore.getState().log('error', message, context, tags);
