import type { CaptureOptions } from '~/types';
import os from 'node:os';
import { captureDarwin } from './platform/darwin';
import { captureWindows } from './platform/windows';
import { captureLinux } from './platform/linux';

export const capture = async (options: CaptureOptions = {}): Promise<any> => {
  try {
    switch (os.platform()) {
      case 'darwin':
        return captureDarwin(options);
      case 'win32':
        return captureWindows(options);
      case 'linux':
        return captureLinux(options);
      default: {
        throw new Error(`Unsupported platform: ${os.platform()}`);
      }
    }
  } catch (error) {
    return { type: 'error', error };
  }
};
