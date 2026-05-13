import { useState, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { FileUp } from 'lucide-react';
import { formatBytes } from '../../shared/format';
import type { AddLog } from '../logs/logStore';

interface FileUploadPanelProps {
  addLog: AddLog;
}

interface FileRecord {
  name: string;
  size: string;
  type: string;
  lastModified: string;
}

const uploadRows: Array<{ label: string; props: InputHTMLAttributes<HTMLInputElement> }> = [
  { label: 'Any file', props: {} },
  { label: 'Multiple files', props: { multiple: true } },
  { label: 'Image only', props: { accept: 'image/*' } },
  { label: 'Camera capture', props: { accept: 'image/*', capture: 'environment' } },
  { label: 'Video only', props: { accept: 'video/*' } },
  { label: 'PDF/document', props: { accept: 'application/pdf,.doc,.docx,.txt' } },
];

export function FileUploadPanel({ addLog }: FileUploadPanelProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);

  const onChange = (event: ChangeEvent<HTMLInputElement>, label: string) => {
    const selected = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || 'unknown',
      lastModified: new Date(file.lastModified).toISOString(),
    }));

    setFiles(selected);
    addLog('upload', selected.length ? 'success' : 'warning', `${label}: ${selected.length} file(s) selected`, selected);
  };

  return (
    <section className="panel" aria-labelledby="upload-title">
      <div className="panel__header">
        <div>
          <p className="eyebrow">File Upload</p>
          <h2 id="upload-title">Picker Variants</h2>
        </div>
      </div>

      <div className="upload-grid" data-testid="upload-panel">
        {uploadRows.map((row) => (
          <label className="upload-tile" key={row.label}>
            <FileUp size={20} />
            <strong>{row.label}</strong>
            <span>Open picker</span>
            <input type="file" onChange={(event) => onChange(event, row.label)} {...row.props} />
          </label>
        ))}
      </div>

      <div className="data-box">
        <h3>Selected files</h3>
        {files.length === 0 ? (
          <p className="muted">No files selected yet.</p>
        ) : (
          <div className="table-list">
            {files.map((file) => (
              <div className="table-row" key={`${file.name}-${file.lastModified}`}>
                <div className="table-row__title">
                  <strong>{file.name}</strong>
                  <small>{file.type}</small>
                </div>
                <span className="status">{file.size}</span>
                <span className="status">{file.lastModified}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
