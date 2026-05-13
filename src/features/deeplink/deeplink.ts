export interface DeeplinkTarget {
  label: string;
  url: string;
  mode: 'same-window' | 'new-window';
}

export const deeplinkTargets: DeeplinkTarget[] = [
  { label: 'Custom scheme', url: 'myapp://qa/product/123', mode: 'same-window' },
  { label: 'Android intent', url: 'intent://qa/product/123#Intent;scheme=myapp;package=com.example.app;end', mode: 'same-window' },
  { label: 'Telephone', url: 'tel:01000000000', mode: 'same-window' },
  { label: 'Mail', url: 'mailto:qa@example.com?subject=WebView%20QA', mode: 'same-window' },
  { label: 'Target blank HTTPS', url: 'https://example.com', mode: 'new-window' },
];

export function openDeeplink(target: DeeplinkTarget) {
  if (target.mode === 'new-window') {
    window.open(target.url, '_blank', 'noopener,noreferrer');
    return 'window.open';
  }

  window.location.href = target.url;
  return 'same-window';
}
