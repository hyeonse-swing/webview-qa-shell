import { useEffect, useMemo, useState } from 'react';
import { DeeplinkPanel } from '../../features/deeplink/DeeplinkPanel';
import { FileUploadPanel } from '../../features/file-upload/FileUploadPanel';
import { FormsPanel } from '../../features/forms/FormsPanel';
import { installConsoleCapture } from '../../features/logs/consoleCapture';
import { LogsPanel } from '../../features/logs/LogsPanel';
import { useEventLog } from '../../features/logs/logStore';
import { NavigationPanel } from '../../features/navigation/NavigationPanel';
import { OverviewPanel } from '../../features/overview/OverviewPanel';
import { PermissionsPanel } from '../../features/permissions/PermissionsPanel';
import { StoragePanel } from '../../features/storage/StoragePanel';
import { collectRuntimeSnapshot } from '../../features/viewport/viewport';
import { ViewportPanel } from '../../features/viewport/ViewportPanel';
import type { PanelId, PlatformMode, RuntimeSnapshot } from '../../shared/types';
import { DiagnosticsStrip } from './DiagnosticsStrip';
import { HeaderStatus } from './HeaderStatus';
import { SideNav } from './SideNav';

const lifecycleEvents = ['resize', 'orientationchange', 'visibilitychange', 'focus', 'blur', 'pagehide', 'pageshow', 'online', 'offline'];

export function ConsoleLayout() {
  const [activePanel, setActivePanel] = useState<PanelId>('overview');
  const [platformMode, setPlatformMode] = useState<PlatformMode>('auto');
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(() => collectRuntimeSnapshot());
  const { logs, addLog, clearLogs } = useEventLog();

  const refreshSnapshot = () => {
    const next = collectRuntimeSnapshot();
    setSnapshot(next);
    addLog('runtime', 'info', 'Runtime snapshot refreshed', next);
  };

  useEffect(() => installConsoleCapture(addLog), [addLog]);

  useEffect(() => {
    const handleLifecycleEvent = (event: Event) => {
      addLog('window', 'info', event.type, {
        visibilityState: document.visibilityState,
        online: navigator.onLine,
      });

      if (event.type === 'resize' || event.type === 'orientationchange' || event.type === 'online' || event.type === 'offline') {
        setSnapshot(collectRuntimeSnapshot());
      }
    };

    lifecycleEvents.forEach((eventName) => window.addEventListener(eventName, handleLifecycleEvent));
    window.addEventListener('error', (event) => {
      addLog('window', 'error', event.message, {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    });
    window.addEventListener('unhandledrejection', (event) => {
      addLog('window', 'error', 'Unhandled promise rejection', { reason: String(event.reason) });
    });

    return () => {
      lifecycleEvents.forEach((eventName) => window.removeEventListener(eventName, handleLifecycleEvent));
    };
  }, [addLog]);

  const activeContent = useMemo(() => {
    const props = { addLog };

    switch (activePanel) {
      case 'overview':
        return <OverviewPanel snapshot={snapshot} logs={logs} refreshSnapshot={refreshSnapshot} {...props} />;
      case 'viewport':
        return <ViewportPanel snapshot={snapshot} {...props} />;
      case 'permissions':
        return <PermissionsPanel {...props} />;
      case 'deeplink':
        return <DeeplinkPanel {...props} />;
      case 'upload':
        return <FileUploadPanel {...props} />;
      case 'navigation':
        return <NavigationPanel {...props} />;
      case 'forms':
        return <FormsPanel {...props} />;
      case 'storage':
        return <StoragePanel {...props} />;
      case 'logs':
        return <LogsPanel logs={logs} addLog={addLog} clearLogs={clearLogs} />;
      default:
        return null;
    }
  }, [activePanel, addLog, clearLogs, logs, refreshSnapshot, snapshot]);

  return (
    <div className={`app-shell app-shell--${platformMode}`}>
      <HeaderStatus
        platformMode={platformMode}
        setPlatformMode={setPlatformMode}
        snapshot={snapshot}
        logs={logs}
        refreshSnapshot={refreshSnapshot}
        addLog={addLog}
      />

      <div className="workspace">
        <SideNav activePanel={activePanel} setActivePanel={setActivePanel} />
        <main className="main-panel">{activeContent}</main>
        <aside className="log-rail">
          <LogsPanel logs={logs.slice(0, 20)} addLog={addLog} clearLogs={clearLogs} />
        </aside>
      </div>

      <DiagnosticsStrip snapshot={snapshot} />
    </div>
  );
}
