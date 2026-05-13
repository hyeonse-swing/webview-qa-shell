export function isStorageAvailable(kind: 'localStorage' | 'sessionStorage') {
  try {
    const storage = window[kind];
    const key = '__webview_qa_probe__';
    storage.setItem(key, key);
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function isIndexedDbAvailable() {
  return typeof window.indexedDB !== 'undefined';
}

export function hasSecureContext() {
  return window.isSecureContext === true;
}

export function queryPermission(name: PermissionName) {
  if (!navigator.permissions?.query) {
    return Promise.resolve('unsupported');
  }

  return navigator.permissions
    .query({ name })
    .then((status) => status.state)
    .catch(() => 'unsupported');
}
