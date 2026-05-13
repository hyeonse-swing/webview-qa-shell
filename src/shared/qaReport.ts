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
    await navigator.clipboard.writeText(text);
    return 'clipboard';
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();

  return 'fallback';
}
