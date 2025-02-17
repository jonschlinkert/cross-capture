import type { CaptureOptions } from '~/types';
import cp from 'node:child_process';
import fs from 'node:fs';
import { createOptions, createResponse } from '~/helpers';

export const captureDarwin = async (options: CaptureOptions = {}): Promise<any> => {
  const { tempFile, config } = createOptions(options);
  const { clipboard, cursor, delay, interactive, region = {}, retina, window } = config;
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
          if (line.includes(window?.title || '')) {
            args.push(line.split(':')[0]);
            return true;
          }
          return false;
        });

    } else if (interactive) {
      args.push('-i');
    }

    if (cursor) args.push('-C');
    if (delay) args.push('-T', delay.toString());
    if (retina === false) args.push('-R');
    if (clipboard) args.push('-c');

    if (region?.width && region?.height) {
      args.push('-R', `${x},${y},${width},${height}`);
    }

    if (!clipboard) {
      args.push(tempFile);
    }

    const proc = cp.spawn('screencapture', args);

    proc.on('close', code => {
      // We're not throwing an error here so that the "capture"
      // function or the implementor can handle it
      resolve(createResponse({
        clipboard,
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
