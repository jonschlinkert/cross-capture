import type { CaptureOptions } from '~/types';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const createOptions = (options: CaptureOptions): CaptureOptions => {
  const tmpdir = options.tempFile
    ? path.dirname(options.tempFile)
    : os.platform() === 'win32'
      ? process.env.TEMP
      : fs.existsSync('/tmp')
        ? '/tmp'
        : os.tmpdir();

  const filename = `screenshot_${Date.now()}.${options.format || 'png'}`;
  const tempFile = options.tempFile || path.join(tmpdir, filename);
  const config = {
    ...options,
    interactive: options.interactive ?? (!options.region && !options.window),
    quality: Math.max(0, Math.min(100, options.quality || 100))
  };

  return { tempFile, config };
};

export const createResponse = ({
  command,
  code,
  tempFile,
  options
}: {
  command: string;
  code: number;
  tempFile: string;
  options: CaptureOptions;
}): CaptureOptions => {
  if (code === 0) {
    return { type: 'data', data: toBase64(tempFile, options) };
  }
  return {
    type: 'error',
    error: new Error(`${command} failed` + (code ? ` with code ${code}` : ''))
  };
};

export const toBase64 = (tempFile: string, options: CaptureOptions): CaptureOptions => {
  const imageData = fs.readFileSync(tempFile);
  const base64Data = imageData.toString('base64');
  return `data:image/${options?.format || 'png'};base64,${base64Data}`;
};
