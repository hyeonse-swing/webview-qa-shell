import { hasSecureContext, queryPermission } from '../../shared/capability';

export type PermissionProbeName = 'geolocation' | 'camera' | 'microphone' | 'clipboard-read' | 'notifications';

export interface PermissionProbe {
  name: PermissionProbeName;
  supported: boolean;
  secureContextRequired: boolean;
  state: string;
}

export async function collectPermissionProbes(): Promise<PermissionProbe[]> {
  const secure = hasSecureContext();
  const probes: Array<[PermissionProbeName, boolean, PermissionName | null]> = [
    ['geolocation', 'geolocation' in navigator, 'geolocation'],
    ['camera', Boolean(navigator.mediaDevices?.getUserMedia), 'camera' as PermissionName],
    ['microphone', Boolean(navigator.mediaDevices?.getUserMedia), 'microphone' as PermissionName],
    ['clipboard-read', Boolean(navigator.clipboard?.readText), 'clipboard-read' as PermissionName],
    ['notifications', 'Notification' in window, 'notifications' as PermissionName],
  ];

  return Promise.all(
    probes.map(async ([name, supported, permissionName]) => ({
      name,
      supported,
      secureContextRequired: name !== 'notifications',
      state: supported && permissionName ? await queryPermission(permissionName) : secure ? 'unsupported' : 'requires-secure-context',
    })),
  );
}
