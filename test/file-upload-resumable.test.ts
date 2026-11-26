/**
 * FileUploadEnhanced resumable uploads
 * Progress is saved per chunk, a re-added file resumes with the same id and
 * skips finished chunks, and finished or removed uploads are forgotten.
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { FileUploadEnhanced } from '../src/js/file-upload-enhanced';

const KEY = 'amphibious-uploads';
const CHUNK = 10;

type Sent = { chunkIndex: string; fileId: string };
let sent: Sent[] = [];
let failAt: number | null = null;
const RealXHR = globalThis.XMLHttpRequest;

class FakeXHR {
  status = 0;
  statusText = '';
  response = '{}';
  upload = { addEventListener() {} };
  withCredentials = false;
  timeout = 0;
  private listeners: Record<string, Array<() => void>> = {};
  open() {}
  setRequestHeader() {}
  abort() {}
  addEventListener(type: string, fn: () => void) {
    (this.listeners[type] ??= []).push(fn);
  }
  send(body: FormData) {
    const chunkIndex = String(body.get('chunkIndex'));
    sent.push({ chunkIndex, fileId: String(body.get('fileId')) });
    const fail = failAt !== null && Number(chunkIndex) === failAt;
    queueMicrotask(() => {
      this.status = fail ? 500 : 200;
      this.statusText = fail ? 'Server Error' : 'OK';
      for (const fn of this.listeners.load ?? []) fn();
    });
  }
}

function file(name = 'video.mp4', size = 35, type = 'video/mp4'): File {
  return new File(['x'.repeat(size)], name, { type });
}

const settle = () => new Promise((r) => setTimeout(r, 30));

function make() {
  const el = document.getElementById('up') as HTMLElement;
  return new FileUploadEnhanced(el, {
    chunked: true,
    chunkSize: CHUNK,
    resumable: true,
    retryCount: 0,
    retryDelay: 0,
    preview: false,
  });
}

describe('FileUploadEnhanced resumable uploads', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="up"></div>';
    localStorage.clear();
    sent = [];
    failAt = null;
    // biome-ignore lint/suspicious/noExplicitAny: swapping in a test double
    (globalThis as any).XMLHttpRequest = FakeXHR;
  });

  afterEach(() => {
    globalThis.XMLHttpRequest = RealXHR;
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('saves progress after each chunk and resumes where it stopped', async () => {
    failAt = 2; // chunks 0 and 1 succeed, chunk 2 fails
    const first = make();
    first.addFiles([file()]);
    await settle();
    first.upload();
    await settle();

    const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].chunks.slice(0, 2)).toEqual([true, true]);
    const id = saved[0].id;

    // Page reload: new instance, user picks the same file again
    first.destroy();
    document.body.innerHTML = '<div id="up"></div>';
    sent = [];
    failAt = null;
    const second = make();
    second.addFiles([file()]);
    await settle();
    second.upload();
    await settle();

    expect(sent.map((s) => s.chunkIndex)).toEqual(['2', '3']);
    expect(new Set(sent.map((s) => s.fileId))).toEqual(new Set([id]));
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toEqual([]);
  });

  it('does not resume a different file', async () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([
        { id: 'old', name: 'video.mp4', size: 99, type: 'video/mp4', chunks: [true], progress: 10 },
      ]),
    );
    const up = make();
    up.addFiles([file()]);
    await settle();
    up.upload();
    await settle();
    expect(sent.map((s) => s.chunkIndex)).toEqual(['0', '1', '2', '3']);
    expect(sent.every((s) => s.fileId !== 'old')).toBe(true);
  });

  it('ignores malformed saved data', async () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 1 }, 'x', null, { chunks: 'no' }]));
    const up = make();
    up.addFiles([file()]);
    await settle();
    up.upload();
    await settle();
    expect(sent).toHaveLength(4);
  });

  it('forgets a saved upload when the file is removed', async () => {
    failAt = 1;
    const up = make();
    up.addFiles([file()]);
    await settle();
    up.upload();
    await settle();
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toHaveLength(1);
    const [entry] = up.getFiles();
    up.removeFile(entry.id);
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toEqual([]);
  });
});
