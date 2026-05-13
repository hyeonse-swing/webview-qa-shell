import { useEffect, useState } from 'react';
import { Clipboard, LocateFixed, Mic, Camera, Bell, RefreshCw } from 'lucide-react';
import { collectPermissionProbes, type PermissionProbe } from './permissions';
import type { AddLog } from '../logs/logStore';

interface PermissionsPanelProps {
  addLog: AddLog;
}

const icons = {
  geolocation: LocateFixed,
  camera: Camera,
  microphone: Mic,
  'clipboard-read': Clipboard,
  notifications: Bell,
};

export function PermissionsPanel({ addLog }: PermissionsPanelProps) {
  const [probes, setProbes] = useState<PermissionProbe[]>([]);

  const scan = async () => {
    const next = await collectPermissionProbes();
    setProbes(next);
    addLog('permissions', 'info', 'Permission capability scan completed', next);
  };

  useEffect(() => {
    void scan();
  }, []);

  const request = async (name: PermissionProbe['name']) => {
    try {
      if (name === 'geolocation') {
        await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8_000 }),
        );
      }

      if (name === 'camera' || name === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: name === 'camera',
          audio: name === 'microphone',
        });
        stream.getTracks().forEach((track) => track.stop());
      }

      if (name === 'clipboard-read') {
        await navigator.clipboard.writeText('webview qa clipboard probe');
      }

      if (name === 'notifications' && 'Notification' in window) {
        await Notification.requestPermission();
      }

      addLog('permissions', 'success', `Permission request finished: ${name}`);
      await scan();
    } catch (error) {
      addLog('permissions', 'error', `Permission request failed: ${name}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <section className="panel" aria-labelledby="permissions-title">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Permissions</p>
          <h2 id="permissions-title">Capability Panel</h2>
        </div>
        <button type="button" onClick={scan}>
          <RefreshCw size={16} />
          Scan
        </button>
      </div>

      <div className="table-list" data-testid="permissions-panel">
        {probes.map((probe) => {
          const Icon = icons[probe.name];

          return (
            <div className="table-row" key={probe.name}>
              <div className="table-row__title">
                <Icon size={18} />
                <strong>{probe.name}</strong>
              </div>
              <span className={probe.supported ? 'status status--pass' : 'status status--muted'}>
                {probe.supported ? 'supported' : 'unsupported'}
              </span>
              <span className="status">{probe.state}</span>
              <button type="button" onClick={() => request(probe.name)} disabled={!probe.supported}>
                Request
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
