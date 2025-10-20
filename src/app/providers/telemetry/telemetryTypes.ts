export interface TelemetryEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: string;
  timestamp: number;
  payload: TPayload;
  tags?: readonly string[];
}

export type TelemetrySink = (event: TelemetryEvent) => void;

export interface TelemetryClient {
  emit: (event: TelemetryEvent) => void;
  track: (name: string, payload?: Record<string, unknown>, tags?: readonly string[]) => void;
  registerSink: (sink: TelemetrySink) => () => void;
  getBuffer: () => readonly TelemetryEvent[];
  flushBuffer: () => void;
}
