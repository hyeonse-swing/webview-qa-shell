import type { AddLog } from './logStore';

export function installConsoleCapture(addLog: AddLog) {
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  console.log = (...args: unknown[]) => {
    original.log(...args);
    addLog('console', 'info', stringifyConsoleArgs(args));
  };

  console.warn = (...args: unknown[]) => {
    original.warn(...args);
    addLog('console', 'warning', stringifyConsoleArgs(args));
  };

  console.error = (...args: unknown[]) => {
    original.error(...args);
    addLog('console', 'error', stringifyConsoleArgs(args));
  };

  return () => {
    console.log = original.log;
    console.warn = original.warn;
    console.error = original.error;
  };
}

function stringifyConsoleArgs(args: unknown[]) {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
}
