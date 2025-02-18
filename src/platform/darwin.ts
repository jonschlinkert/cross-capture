import type { CaptureOptions } from '~/types';
import cp from 'node:child_process';
import fs from 'node:fs';
import { createOptions, createResponse } from '~/helpers';

export const captureDarwin = async (options: CaptureOptions = {}): Promise<any> => {
  const { tempFile, config } = createOptions(options);
  const { cursor, interactive, region = {}, retina, window } = config;
  const { x, y, width, height } = region;

  return new Promise((resolve, reject) => {
    const args: string[] = [];

    if (window?.interactive) {
      args.push('-w');
    } else if (window?.title || window?.id) {
      args.push('-l');

      cp.execSync('screencapture -L')
        .toString()
        .split('\n')
        .find(line => {
          const parts = line.split(':');
          const id = parts[0]?.trim();

          if (!id) {
            return false;
          }

          if (window.id && id === window.id) {
            args.push(id);
            return true;
          }

          if (window.title && line.includes(window.title)) {
            args.push(id);
            return true;
          }

          return false;
        });

    } else if (interactive) {
      args.push('-i');
    }

    if (cursor) args.push('-C');
    if (retina === false) args.push('-R');

    if (region?.width && region?.height) {
      args.push('-R', `${x},${y},${width},${height}`);
    }

    args.push(tempFile);

    const proc = cp.spawn('screencapture', args);

    proc.on('close', code => {
      resolve(createResponse({
        code,
        command: 'screencapture',
        options: config,
        tempFile
      }));
    });

    proc.on('error', reject);
  }).finally(() => {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  });
};
