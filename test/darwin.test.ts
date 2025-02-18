/* eslint-disable no-invalid-this */
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import os from 'node:os';
import fs from 'node:fs';
import cp from 'node:child_process';
import { captureDarwin } from '~/platform/darwin';

describe('captureDarwin', () => {
  before(function() {
    if (os.platform() !== 'darwin') {
      console.log('Skipping Darwin tests, since platform is not darwin');
      this.skip();
    }
  });

  describe('basic functionality', () => {
    it('should capture screenshot with default options', async () => {
      const result = await captureDarwin();
      assert.equal(typeof result.code, 'number');
      assert.equal(result.command, 'screencapture');
      assert.ok(result.options);
      assert.ok(result.tempFile);
    });

    it('should handle window capture with title', async () => {
      const window = { title: 'Test Window' };
      const result = await captureDarwin({ window });
      assert.equal(typeof result.code, 'number');
      assert.ok(result.options.window);
      assert.equal(result.options.window.title, 'Test Window');
    });

    it('should capture region with specified dimensions', async () => {
      const region = { x: 0, y: 0, width: 100, height: 100 };
      const result = await captureDarwin({ region });
      assert.equal(typeof result.code, 'number');
      assert.deepEqual(result.options.region, region);
    });

    it('should handle interactive mode', async () => {
      const result = await captureDarwin({ interactive: true });
      assert.equal(typeof result.code, 'number');
      assert.equal(result.options.interactive, true);
    });

    it('should handle cursor option', async () => {
      const result = await captureDarwin({ cursor: true });
      assert.equal(typeof result.code, 'number');
      assert.equal(result.options.cursor, true);
    });

    it('should handle retina option', async () => {
      const result = await captureDarwin({ retina: false });
      assert.equal(typeof result.code, 'number');
      assert.equal(result.options.retina, false);
    });
  });

  describe('error handling', () => {
    it('should handle process errors', async () => {
      const orig = cp.spawn;
      cp.spawn = () => {
        const proc = new EventEmitter();
        setTimeout(() => proc.emit('error', new Error('Test error')), 0);
        return proc as any;
      };

      try {
        await assert.rejects(
          captureDarwin(),
          /Test error/
        );
      } finally {
        cp.spawn = orig;
      }
    });

    it('should clean up temp file on error', async () => {
      const orig = cp.spawn;
      cp.spawn = () => {
        const proc = new EventEmitter();
        setTimeout(() => proc.emit('error', new Error('Test error')), 0);
        return proc as any;
      };

      try {
        await captureDarwin();
      } catch (err) {
        const tempFiles = fs.readdirSync(os.tmpdir())
          .filter(f => f.includes('screenshot'));
        assert.equal(tempFiles.length, 0);
      } finally {
        cp.spawn = orig;
      }
    });
  });

  describe('window capture', () => {
    it('should handle interactive window selection', async () => {
      const result = await captureDarwin({
        window: { interactive: true }
      });
      assert.equal(typeof result.code, 'number');
      assert.ok(result.options.window.interactive);
    });

    it('should handle window capture by id', async () => {
      const window = { id: '123' };
      const result = await captureDarwin({ window });
      assert.equal(typeof result.code, 'number');
      assert.ok(result.options.window);
      assert.equal(result.options.window.id, '123');
    });
  });

  describe('command arguments', () => {
    it('should generate correct args for region capture', async () => {
      const region = { x: 100, y: 200, width: 300, height: 400 };
      const result = await captureDarwin({ region });
      assert.equal(typeof result.code, 'number');
      assert.deepEqual(result.options.region, region);
    });

    it('should generate correct args for window list', async () => {
      const orig = cp.execSync;
      cp.execSync = () => Buffer.from('1:Test Window\n2:Another Window');

      try {
        const result = await captureDarwin({
          window: { title: 'Test Window' }
        });
        assert.equal(typeof result.code, 'number');
        assert.equal(result.options.window.title, 'Test Window');
      } finally {
        cp.execSync = orig;
      }
    });
  });
});
