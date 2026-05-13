import { describe, expect, it } from 'vitest';
import { guessPlatform } from './viewport';

describe('guessPlatform', () => {
  it('detects Android user agents', () => {
    expect(guessPlatform('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36')).toBe('android');
  });

  it('detects iOS user agents', () => {
    expect(guessPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15')).toBe('ios');
  });

  it('detects desktop user agents', () => {
    expect(guessPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15')).toBe('desktop');
  });
});
