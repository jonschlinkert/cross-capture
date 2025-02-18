import type { CaptureOptions } from '~/types';
import cp from 'node:child_process';
import fs from 'node:fs';
import { createOptions, createResponse } from '~/helpers';

export const captureLinux = async (options: CaptureOptions = {}): Promise<any> => {
  const { tempFile, config } = createOptions(options);
  const { cursor, region, window } = config;
  const { x, y, width, height } = region;

  return new Promise((resolve, reject) => {
    const isWayland = process.env.XDG_SESSION_TYPE === 'wayland';
    let command: string;

    if (window?.title) {
      if (isWayland) {
        command = `
          WINDOW_ID=$(swaymsg -t get_tree | jq -r '..|select(.name?"${window.title}")?.rect | select(.x) | "\\(.x),\\(.y) \\(.width)x\\(.height)"' | head -1)
          if [ ! -z "$WINDOW_ID" ]; then
            grim ${cursor ? '' : '-c'} -g "$WINDOW_ID" "${tempFile}"
          else
            exit 1
          fi
        `;
      } else {
        command = `
          WINDOW_ID=$(xdotool search --name "${window.title}" | head -1)
          if [ ! -z "$WINDOW_ID" ]; then
            xdotool windowactivate $WINDOW_ID
            maim ${cursor ? '-u' : ''} -i $WINDOW_ID "${tempFile}"
          else
            exit 1
          fi
        `;
      }
    } else if (region) {
      if (isWayland) {
        command = `grim ${cursor ? '' : '-c'} -g "${x},${y} ${width}x${height}" "${tempFile}"`;
      } else {
        command = `maim ${cursor ? '-u' : ''} -g "${width}x${height}+${x}+${y}" "${tempFile}"`;
      }
    } else if (isWayland) {
      command = `grim ${cursor ? '' : '-c'} -g "$(slurp)" "${tempFile}"`;
    } else {
      command = `maim ${cursor ? '-u' : ''} -s "${tempFile}"`;
    }

    const proc = cp.spawn('sh', ['-c', command]);

    proc.on('close', code => {
      resolve(createResponse({
        code,
        command: 'Screenshot capture',
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
