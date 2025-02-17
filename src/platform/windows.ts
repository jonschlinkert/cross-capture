import type { CaptureOptions } from '~/types';
import cp from 'node:child_process';
import fs from 'node:fs';
import { createResponse, createOptions } from '~/helpers';

export const captureWindows = async (options: CaptureOptions = {}): Promise<any> => {
  const { tempFile, config } = createOptions(options);
  const { clipboard, cursor, delay, format, region, window } = config;
  const { x, y, width, height } = region;

  return new Promise((resolve, reject) => {
    let script = '';

    if (window?.title) {
      script = `
        Add-Type @"
          using System;
          using System.Runtime.InteropServices;
          public class Window {
            [DllImport("user32.dll")] public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
            [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
            [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
            public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
          }
"@

        $window = [Window]::FindWindow($null, "${window.title}")
        if ($window) {
          [Window]::SetForegroundWindow($window)
          Start-Sleep -Milliseconds ${delay || 200}

          $rect = New-Object Window+RECT
          [void][Window]::GetWindowRect($window, [ref]$rect)

          $bounds = New-Object System.Drawing.Rectangle
          $bounds.X = $rect.Left
          $bounds.Y = $rect.Top
          $bounds.Width = $rect.Right - $rect.Left
          $bounds.Height = $rect.Bottom - $rect.Top

          $bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
          $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
          $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)

          ${clipboard ? '$bitmap.SetToClipboard()' : `$bitmap.Save('${tempFile}', [System.Drawing.Imaging.ImageFormat]::${format === 'jpg' ? 'Jpeg' : 'Png'})`}
        }
      `;
    } else if (region) {
      script = `
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing

        $bounds = New-Object System.Drawing.Rectangle ${x}, ${y}, ${width}, ${height}
        $bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

        if (${cursor ?? false}) {
          $cursor = [System.Windows.Forms.Cursor]::Current
          $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
          $cursor.Draw($graphics, New-Object System.Drawing.Rectangle($cursor.Position.X - $bounds.X, $cursor.Position.Y - $bounds.Y, $cursor.Size.Width, $cursor.Size.Height))
        } else {
          $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
        }

        ${clipboard ? '$bitmap.SetToClipboard()' : `$bitmap.Save('${tempFile}', [System.Drawing.Imaging.ImageFormat]::${format === 'jpg' ? 'Jpeg' : 'Png'})`}
      `;
    } else {
      script = `
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing

        $form = New-Object System.Windows.Forms.Form
        $form.TopMost = $true
        $form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
        $form.WindowState = [System.Windows.Forms.FormWindowState]::Maximized
        $form.Opacity = 0.1

        $form.Add_KeyDown({
          if ($_.KeyCode -eq [System.Windows.Forms.Keys]::Escape) {
            $form.Close()
          }
        })

        $form.Add_MouseDown({
          $script:start = $_.Location
          $form.DialogResult = [System.Windows.Forms.DialogResult]::None
        })

        $form.Add_MouseUp({
          $end = $_.Location
          $form.DialogResult = [System.Windows.Forms.DialogResult]::OK
          $form.Close()

          $bounds = New-Object System.Drawing.Rectangle
          $bounds.X = [Math]::Min($script:start.X, $end.X)
          $bounds.Y = [Math]::Min($script:start.Y, $end.Y)
          $bounds.Width = [Math]::Abs($end.X - $script:start.X)
          $bounds.Height = [Math]::Abs($end.Y - $script:start.Y)

          $bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
          $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

          if (${cursor ?? false}) {
            $cursor = [System.Windows.Forms.Cursor]::Current
            $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
            $cursor.Draw($graphics, New-Object System.Drawing.Rectangle($cursor.Position.X - $bounds.X, $cursor.Position.Y - $bounds.Y, $cursor.Size.Width, $cursor.Size.Height))
          } else {
            $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
          }

          ${clipboard ? '$bitmap.SetToClipboard()' : `$bitmap.Save('${tempFile}', [System.Drawing.Imaging.ImageFormat]::${format === 'jpg' ? 'Jpeg' : 'Png'})`}
        })

        $form.ShowDialog()
      `;
    }

    if (delay) {
      script = `Start-Sleep -Seconds ${delay}; ${script}`;
    }

    const proc = cp.spawn('powershell', ['-command', script]);

    proc.on('close', code => {
      // We're not throwing an error here so that the "capture"
      // function or the implementor can handle it
      resolve(createResponse({
        clipboard,
        code,
        command: 'PowerShell screenshot',
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
