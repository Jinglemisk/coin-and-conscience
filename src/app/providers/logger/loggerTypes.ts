export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEvent {
  id: string;
  level: LogLevel;
  message: string;
  tags?: readonly string[];
  context?: Record<string, unknown>;
  timestamp: number;
}

export interface LoggerOptions {
  enableBuffer?: boolean;
  maxBufferSize?: number;
  defaultTags?: readonly string[];
}
