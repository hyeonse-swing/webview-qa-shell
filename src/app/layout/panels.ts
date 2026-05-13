import {
  Box,
  Database,
  FileUp,
  FormInput,
  Gauge,
  Link,
  List,
  LockKeyhole,
  MonitorSmartphone,
} from 'lucide-react';
import type { PanelId } from '../../shared/types';

export const panels: Array<{
  id: PanelId;
  label: string;
  description: string;
  icon: typeof MonitorSmartphone;
}> = [
  { id: 'overview', label: 'Overview', description: 'Runtime and report', icon: MonitorSmartphone },
  { id: 'viewport', label: 'Insets', description: 'Viewport and safe-area', icon: Gauge },
  { id: 'permissions', label: 'Permissions', description: 'Native prompts', icon: LockKeyhole },
  { id: 'deeplink', label: 'Deep Links', description: 'Schemes and fallback', icon: Link },
  { id: 'upload', label: 'Upload', description: 'File picker variants', icon: FileUp },
  { id: 'navigation', label: 'Navigation', description: 'History and windows', icon: Box },
  { id: 'forms', label: 'Forms', description: 'Keyboard and inputs', icon: FormInput },
  { id: 'storage', label: 'Storage', description: 'Persistence checks', icon: Database },
  { id: 'logs', label: 'Logs', description: 'Events and errors', icon: List },
];
