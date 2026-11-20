import { formatJson } from './format';
import type { LogEntry, RuntimeSnapshot } from './types';

export function createQaReport(snapshot: RuntimeSnapshot, logs: LogEntry[]) {
  return {
    title: 'WebView QA Console Report',
    generatedAt: new Date().toISOString(),
    snapshot,
    logs: logs.slice(0, 80),
  };
}

export function createQaReportText(snapshot: RuntimeSnapshot, logs: LogEntry[]) {
  return formatJson(createQaReport(snapshot, logs));
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return 'clipboard';
    } catch {
      // Some WebViews expose the API but deny clipboard access.
    }
  }

  const previousFocus = document.activeElement as HTMLElement | null;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    if (!document.execCommand('copy')) throw new Error('Copy failed');
  } finally {
    textarea.remove();
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }

  return 'fallback';
}
