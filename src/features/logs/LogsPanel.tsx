import { Copy, Trash2 } from 'lucide-react';
import { formatJson, shortTime } from '../../shared/format';
import { useCopyFeedback } from '../../shared/useCopyFeedback';
import type { LogEntry } from '../../shared/types';
import type { AddLog } from './logStore';

interface LogsPanelProps {
  logs: LogEntry[];
  addLog: AddLog;
  clearLogs: () => void;
}

export function LogsPanel({ logs, addLog, clearLogs }: LogsPanelProps) {
  const { copy, feedback } = useCopyFeedback('logs', 'Copied event logs', 'Could not copy event logs', addLog);

  return (
    <section className="panel" aria-labelledby="logs-title">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Event Stream</p>
          <h2 id="logs-title">Logs</h2>
        </div>
        <div className="button-row">
          <button className="icon-button" type="button" onClick={() => copy(formatJson(logs))} aria-disabled={feedback.pending} aria-label="Copy logs">
            <Copy size={16} />
          </button>
          <button className="icon-button" type="button" onClick={clearLogs} aria-label="Clear logs">
            <Trash2 size={16} />
          </button>
          <span role="status" className={feedback.text ? `status status--${feedback.failed ? 'fail' : 'pass'}` : ''}>
            {feedback.text}
          </span>
        </div>
      </div>

      <div className="log-list" data-testid="event-log">
        {logs.map((log) => (
          <article className={`log-entry log-entry--${log.level}`} key={log.id}>
            <div className="log-entry__meta">
              <span>{shortTime(log.timestamp)}</span>
              <span>{log.source}</span>
              <span>{log.level}</span>
            </div>
            <p>{log.message}</p>
            {log.details !== undefined && <pre>{formatJson(log.details)}</pre>}
          </article>
        ))}
      </div>
    </section>
  );
}
