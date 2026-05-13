import { Platform } from 'react-native';

export const TARGET_PORT = 8080;

declare const process: {
  env?: {
    EXPO_PUBLIC_TARGET_URL?: string;
    EXPO_PUBLIC_TARGET_PORT?: string;
    EXPO_PUBLIC_QA_PORT?: string;
  };
};

function getLocalPort() {
  const rawPort = process.env?.EXPO_PUBLIC_TARGET_PORT ?? process.env?.EXPO_PUBLIC_QA_PORT;
  const parsedPort = rawPort ? Number(rawPort) : TARGET_PORT;

  return Number.isFinite(parsedPort) ? parsedPort : TARGET_PORT;
}

export function getDefaultLocalUrl() {
  const explicitTargetUrl = process.env?.EXPO_PUBLIC_TARGET_URL;

  if (explicitTargetUrl) {
    return explicitTargetUrl;
  }

  const port = getLocalPort();

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}`;
  }

  return `http://localhost:${port}`;
}
