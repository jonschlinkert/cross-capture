import type { CaptureOptions } from '~/types';
import cp from 'node:child_process';
import fs from 'node:fs';
import { createOptions, createResponse } from '~/helpers';

export const captureLinux = async (options: CaptureOptions = {}): Promise<any> => {
  const { tempFile, config } = createOptions(options);
  const { clipboard, cursor, delay, format, region, window } = config;
  const { x, y, width, height } = region;

  return new Promise((resolve, reject) => {
    const isWayland = process.env.XDG_SESSION_TYPE === 'wayland';
    let command: string;

    if (window?.title) {
      if (isWayland) {
        command = `
          WINDOW_ID=$(swaymsg -t get_tree | jq -r '..|select(.name?"${window.title}")?.rect | select(.x) | "\\(.x),\\(.y) \\(.width)x\\(.height)"' | head -1)
          if [ ! -z "$WINDOW_ID" ]; then
            grim ${cursor ? '' : '-c'} -g "$WINDOW_ID" ${clipboard ? '-' : `"${tempFile}"`}
          else
            exit 1
          fi
        `;
      } else {
        command = `
          WINDOW_ID=$(xdotool search --name "${window.title}" | head -1)
          if [ ! -z "$WINDOW_ID" ]; then
            ${delay ? `sleep ${delay};` : ''}
            xdotool windowactivate $WINDOW_ID
            maim ${cursor ? '-u' : ''} -i $WINDOW_ID ${clipboard ? '-' : `"${tempFile}"`}
          else
            exit 1
          fi
        `;
      }
    } else if (region) {
      if (isWayland) {
        command = `grim ${cursor ? '' : '-c'} -g "${x},${y} ${width}x${height}" ${clipboard ? '-' : `"${tempFile}"`}`;
      } else {
        command = `maim ${cursor ? '-u' : ''} -g "${width}x${height}+${x}+${y}" ${clipboard ? '-' : `"${tempFile}"`}`;
      }
    } else if (isWayland) {
      command = `grim ${cursor ? '' : '-c'} -g "$(slurp)" ${clipboard ? '-' : `"${tempFile}"`}`;
    } else {
      command = `maim ${cursor ? '-u' : ''} -s ${clipboard ? '-' : `"${tempFile}"`}`;
    }

    if (clipboard) {
      command += ` | xclip -selection clipboard -t image/${format || 'png'} -i`;
    }

    if (delay) {
      command = `sleep ${delay} && ${command}`;
    }

    const proc = cp.spawn('sh', ['-c', command]);

    proc.on('close', code => {
      // We're not throwing an error here so that the "capture"
      // function or the implementor can handle it
      resolve(createResponse({
        clipboard,
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
