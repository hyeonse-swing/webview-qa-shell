import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const doctorScript = path.join(repositoryRoot, 'scripts', 'doctor.sh');
const temporaryDirectories: string[] = [];

type DoctorFixtureOptions = {
  includeNode?: boolean;
  includeLsof?: boolean;
  includeXcrun?: boolean;
  iosOutput?: string;
  xcrunExitCode?: number;
  avds?: string;
  emulatorExitCode?: number;
  adbServerListening?: boolean;
  adbOutput?: string;
  adbExitCode?: number;
};

function writeExecutable(filePath: string, body: string) {
  writeFileSync(filePath, body);
  chmodSync(filePath, 0o755);
}

function createDoctorFixture(options: DoctorFixtureOptions = {}) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'doctor-test-'));
  temporaryDirectories.push(directory);

  const binDirectory = path.join(directory, 'bin');
  const sdkDirectory = path.join(directory, 'android-sdk');
  mkdirSync(binDirectory);
  mkdirSync(path.join(sdkDirectory, 'emulator'), { recursive: true });
  mkdirSync(path.join(sdkDirectory, 'platform-tools'), { recursive: true });

  if (options.includeNode !== false) {
    writeExecutable(
      path.join(binDirectory, 'node'),
      '#!/bin/sh\nprintf "%s\\n" "${NODE_OUTPUT:-v24.0.0}"\nexit "${NODE_EXIT_CODE:-0}"\n',
    );
  }

  writeExecutable(
    path.join(binDirectory, 'pnpm'),
    '#!/bin/sh\nprintf "%s\\n" "${PNPM_OUTPUT:-10.11.0}"\nexit "${PNPM_EXIT_CODE:-0}"\n',
  );

  if (options.includeXcrun !== false) {
    writeExecutable(
      path.join(binDirectory, 'xcrun'),
      '#!/bin/sh\nprintf "%s\\n" "${XCRUN_OUTPUT:-}"\nexit "${XCRUN_EXIT_CODE:-0}"\n',
    );
  }

  if (options.includeLsof !== false) {
    writeExecutable(
      path.join(binDirectory, 'lsof'),
      '#!/bin/sh\ncase "$*" in *5037*) exit "${ADB_SERVER_LISTENING:-1}" ;; *) exit 1 ;; esac\n',
    );
  }

  writeExecutable(
    path.join(sdkDirectory, 'emulator', 'emulator'),
    '#!/bin/sh\nprintf "%s\\n" "${AVD_OUTPUT:-}"\nexit "${EMULATOR_EXIT_CODE:-0}"\n',
  );
  writeExecutable(
    path.join(sdkDirectory, 'platform-tools', 'adb'),
    '#!/bin/sh\nprintf "adb called\\n" >> "$ADB_LOG"\nprintf "%s\\n" "${ADB_OUTPUT:-List of devices attached}"\nexit "${ADB_EXIT_CODE:-0}"\n',
  );

  const adbLog = path.join(directory, 'adb.log');
  return {
    adbLog,
    environment: {
      PATH: binDirectory,
      HOME: process.env.HOME,
      ANDROID_HOME: sdkDirectory,
      ADB_LOG: adbLog,
      ADB_SERVER_LISTENING: options.adbServerListening ? '0' : '1',
      ADB_OUTPUT: options.adbOutput ?? 'List of devices attached',
      ADB_EXIT_CODE: String(options.adbExitCode ?? 0),
      XCRUN_OUTPUT: options.iosOutput ?? '',
      XCRUN_EXIT_CODE: String(options.xcrunExitCode ?? 0),
      AVD_OUTPUT: options.avds ?? '',
      EMULATOR_EXIT_CODE: String(options.emulatorExitCode ?? 0),
    },
  };
}

function runDoctor(environment: NodeJS.ProcessEnv) {
  return spawnSync('/bin/bash', [doctorScript], {
    encoding: 'utf8',
    env: environment,
    timeout: 10_000,
  });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('doctor script resilience', () => {
  it('continues through every section when Node is missing', () => {
    const fixture = createDoctorFixture({
      includeNode: false,
      includeXcrun: false,
      avds: 'Pixel_API_35',
    });
    const result = runDoctor(fixture.environment);
    const output = result.stdout;

    expect(result.status).toBe(1);
    expect(output).toContain('node not found');
    expect(output).toContain('pnpm:');
    expect(output).toContain('Project dependencies:');
    expect(output).toContain('Reserved/local ports:');
    expect(output).toContain('iOS simulators:');
    expect(output).toContain('xcrun not found');
    expect(output).toContain('Android SDK:');
    expect(output).toContain('Pixel_API_35');
    expect(output).toContain('Android devices:');
  });

  it('continues to report Android when xcrun fails and leaves the supported platform successful', () => {
    const fixture = createDoctorFixture({
      iosOutput: 'CoreSimulatorService is unavailable',
      xcrunExitCode: 69,
      avds: 'Pixel_API_35',
    });
    const result = runDoctor(fixture.environment);
    const output = result.stdout;

    expect(result.status).toBe(0);
    expect(output).toContain('xcrun simctl list devices available failed');
    expect(output).toContain('CoreSimulatorService is unavailable');
    expect(output).toContain('Android AVDs:');
    expect(output).toContain('Pixel_API_35');
    expect(output).toContain('platform gaps are informational');
  });

  it('makes an empty AVD list actionable while preserving an available iOS simulator', () => {
    const fixture = createDoctorFixture({
      iosOutput:
        '== Devices ==\n-- iOS 26.0 --\n    iPhone 17 (AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA) (Shutdown)',
      avds: '',
    });
    const result = runDoctor(fixture.environment);
    const output = result.stdout;

    expect(result.status).toBe(0);
    expect(output).toContain('iPhone 17 (AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA)');
    expect(output).toContain('No Android AVD found. Create one in Android Studio Device Manager.');
    expect(output).toContain('Android devices:');
  });

  it('reports port state as unknown when lsof is unavailable', () => {
    const fixture = createDoctorFixture({
      includeLsof: false,
      avds: 'Pixel_API_35',
    });
    const result = runDoctor(fixture.environment);
    const output = result.stdout;

    expect(result.status).toBe(0);
    expect(output).toContain('3000: unknown (lsof not found)');
    expect(output).not.toContain('3000: free');
    expect(output).toContain('adb was not queried to avoid starting its server');
  });

  it('recognizes connected Android devices with non-hexadecimal serials', () => {
    const fixture = createDoctorFixture({
      avds: 'Pixel_API_35',
      adbServerListening: true,
      adbOutput: 'List of devices attached\nRF8MC1A2B3C\tdevice product:foo',
    });
    const result = runDoctor(fixture.environment);
    const output = result.stdout;

    expect(result.status).toBe(0);
    expect(output).toContain('RF8MC1A2B3C');
    expect(output).not.toContain('No Android device is connected');
  });

  it('reports emulator and adb failures without aborting the remaining diagnostics', () => {
    const fixture = createDoctorFixture({
      avds: 'emulator command failed',
      emulatorExitCode: 7,
      adbServerListening: true,
      adbOutput: 'adb command failed',
      adbExitCode: 7,
    });
    const result = runDoctor(fixture.environment);
    const output = result.stdout;

    expect(result.status).toBe(0);
    expect(output).toContain('emulator -list-avds failed: emulator command failed');
    expect(output).toContain('adb devices failed: adb command failed');
    expect(output).toContain('Exit status:');
  });
});
