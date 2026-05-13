import { Copy, RefreshCw, Send } from 'lucide-react';
import { postToNativeBridge } from '../../shared/nativeBridge';
import { copyText, createQaReportText } from '../../shared/qaReport';
import { formatBoolean, formatJson } from '../../shared/format';
import type { LogEntry, RuntimeSnapshot } from '../../shared/types';
import type { AddLog } from '../logs/logStore';

interface OverviewPanelProps {
  snapshot: RuntimeSnapshot;
  logs: LogEntry[];
  addLog: AddLog;
  refreshSnapshot: () => void;
}

export function OverviewPanel({ snapshot, logs, addLog, refreshSnapshot }: OverviewPanelProps) {
  const copyReport = async () => {
    await copyText(createQaReportText(snapshot, logs));
    addLog('report', 'success', 'Copied QA report');
  };

  const sendBridgeProbe = () => {
    const bridge = postToNativeBridge({ type: 'WEBVIEW_QA_PROBE', snapshot });
    addLog('bridge', 'info', 'Sent native bridge probe where available', bridge);
  };

  return (
    <section className="panel" aria-labelledby="overview-title">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Runtime Overview</p>
          <h2 id="overview-title">WebView QA Console</h2>
        </div>
        <div className="button-row">
          <button type="button" onClick={refreshSnapshot}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button type="button" onClick={copyReport}>
            <Copy size={16} />
            Copy QA Report
          </button>
          <button type="button" onClick={sendBridgeProbe}>
            <Send size={16} />
            Bridge Probe
          </button>
        </div>
      </div>

      <div className="metric-grid" data-testid="runtime-overview">
        <Metric label="Platform guess" value={snapshot.platformGuess} />
        <Metric label="Viewport" value={`${snapshot.viewport.innerWidth} x ${snapshot.viewport.innerHeight}`} />
        <Metric label="Visual viewport" value={`${snapshot.viewport.visualWidth ?? '-'} x ${snapshot.viewport.visualHeight ?? '-'}`} />
        <Metric label="DPR" value={String(snapshot.devicePixelRatio)} />
        <Metric label="Online" value={formatBoolean(snapshot.online)} />
        <Metric label="Cookies" value={formatBoolean(snapshot.cookieEnabled)} />
        <Metric label="Local storage" value={formatBoolean(snapshot.storage.localStorage)} />
        <Metric label="IndexedDB" value={formatBoolean(snapshot.storage.indexedDB)} />
      </div>

      <div className="split-grid">
        <div className="data-box">
          <h3>User Agent</h3>
          <p className="mono breakable">{snapshot.userAgent}</p>
        </div>
        <div className="data-box">
          <h3>Native Bridge</h3>
          <pre>{formatJson(snapshot.nativeBridge)}</pre>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
