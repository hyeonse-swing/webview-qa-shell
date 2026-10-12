import { afterEach, describe, expect, it, vi } from 'vitest';

const platform = vi.hoisted(() => ({ OS: 'ios' }));
vi.mock('react-native', () => ({ Platform: platform }));
import { getDefaultLocalUrl } from './localUrl';

afterEach(() => {
  vi.unstubAllEnvs();
  platform.OS = 'ios';
});

function clearTargetEnv() {
  vi.stubEnv('EXPO_PUBLIC_TARGET_URL', undefined);
  vi.stubEnv('EXPO_PUBLIC_TARGET_PORT', undefined);
  vi.stubEnv('EXPO_PUBLIC_QA_PORT', undefined);
}

describe('launch target selection', () => {
  it('uses the exact staging URL before any local port configuration', () => {
    const url = 'https://stage.example.com/path?q=%2F&x=1#section';
    vi.stubEnv('EXPO_PUBLIC_TARGET_URL', url);
    vi.stubEnv('EXPO_PUBLIC_TARGET_PORT', '9000');
    expect(getDefaultLocalUrl()).toBe(url);
    platform.OS = 'android';
    expect(getDefaultLocalUrl()).toBe(url);
  });

  it('selects the platform-specific localhost address', () => {
    clearTargetEnv();
    expect(getDefaultLocalUrl()).toBe('http://localhost:8080');
    platform.OS = 'android';
    expect(getDefaultLocalUrl()).toBe('http://10.0.2.2:8080');
  });

  it('uses target port ahead of legacy QA port', () => {
    clearTargetEnv();
    vi.stubEnv('EXPO_PUBLIC_QA_PORT', '8090');
    expect(getDefaultLocalUrl()).toBe('http://localhost:8090');
    vi.stubEnv('EXPO_PUBLIC_TARGET_PORT', '9000');
    expect(getDefaultLocalUrl()).toBe('http://localhost:9000');
  });

  it.each(['0', '-1', '3.5', '65536', 'Infinity', 'abc'])('falls back for an invalid configured port: %s', (port) => {
    clearTargetEnv();
    vi.stubEnv('EXPO_PUBLIC_TARGET_PORT', port);
    expect(getDefaultLocalUrl()).toBe('http://localhost:8080');
  });
});
