import { Copy, RefreshCw } from 'lucide-react';
import { copyText, createQaReportText } from '../../shared/qaReport';
import type { LogEntry, PlatformMode, RuntimeSnapshot } from '../../shared/types';
import type { AddLog } from '../../features/logs/logStore';

interface HeaderStatusProps {
  platformMode: PlatformMode;
  setPlatformMode: (mode: PlatformMode) => void;
  snapshot: RuntimeSnapshot;
  logs: LogEntry[];
  refreshSnapshot: () => void;
  addLog: AddLog;
}

export function HeaderStatus({
  platformMode,
  setPlatformMode,
  snapshot,
  logs,
  refreshSnapshot,
  addLog,
}: HeaderStatusProps) {
  const copyReport = async () => {
    await copyText(createQaReportText(snapshot, logs));
    addLog('report', 'success', 'Copied QA report from header');
  };

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Native target http://localhost:8080</p>
        <h1>WebView QA Console</h1>
      </div>

      <div className="header-controls">
        <div className="segmented" aria-label="Platform mode">
          {(['auto', 'android', 'ios'] as const).map((mode) => (
            <button
              key={mode}
              className={platformMode === mode ? 'is-active' : ''}
              type="button"
              onClick={() => {
                setPlatformMode(mode);
                addLog('platform', 'info', `Platform mode set to ${mode}`);
              }}
            >
              {mode}
            </button>
          ))}
        </div>
        <button className="icon-button" type="button" onClick={refreshSnapshot} aria-label="Refresh runtime snapshot">
          <RefreshCw size={16} />
        </button>
        <button type="button" onClick={copyReport}>
          <Copy size={16} />
          Copy Report
        </button>
      </div>
    </header>
  );
}
