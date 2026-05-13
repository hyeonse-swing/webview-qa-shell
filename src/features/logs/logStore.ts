import { useCallback, useState } from 'react';
import { nowIso } from '../../shared/format';
import type { LogEntry, LogLevel } from '../../shared/types';

const MAX_LOGS = 200;

export type AddLog = (source: string, level: LogLevel, message: string, details?: unknown) => void;

export function createLogEntry(source: string, level: LogLevel, message: string, details?: unknown): LogEntry {
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    timestamp: nowIso(),
    source,
    level,
    message,
    details,
  };
}

export function useEventLog() {
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    createLogEntry('system', 'info', 'QA console mounted'),
  ]);

  const addLog = useCallback<AddLog>((source, level, message, details) => {
    setLogs((current) => [createLogEntry(source, level, message, details), ...current].slice(0, MAX_LOGS));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([createLogEntry('system', 'info', 'Logs cleared')]);
  }, []);

  return { logs, addLog, clearLogs };
}
