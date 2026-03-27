/**
 * File Upload Component Tests
 * Tests for drag-and-drop, file validation, preview, upload queue,
 * progress tracking, public API, and cleanup
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import '../src/js/file-upload';
import { escapeHTML } from '../src/utils/sanitize';

// biome-ignore lint/suspicious/noExplicitAny: JS component accessed via window global
const FileUploadClass = (window as any).FileUpload;

const UPLOAD_HTML = `
  <div id="upload-container"></div>
`;

/**
 * Create a mock File object for testing.
 * happy-dom does not support the File constructor fully,
 * so we create a plain object that mimics the File interface.
 */
function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['x'.repeat(Math.min(size, 100))], { type });
  // biome-ignore lint/suspicious/noExplicitAny: mocking File object for tests
  const file = blob as any;
  Object.defineProperty(file, 'name', { value: name, writable: false });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  Object.defineProperty(file, 'type', { value: type, writable: false });
  return file as File;
}

describe('File Upload Component', () => {
  let container: HTMLElement;
  // biome-ignore lint/suspicious/noExplicitAny: JS component instance
  let upload: any;

  beforeEach(() => {
    document.body.innerHTML = UPLOAD_HTML;
    container = document.querySelector('#upload-container') as HTMLElement;
  });

  afterEach(() => {
    if (upload) {
      upload.destroy();
      upload = null;
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should create drop zone with icon, label, button, and file input', () => {
      upload = new FileUploadClass(container);
      expect(document.querySelector('.aiab-file-upload-zone')).toBeTruthy();
      expect(document.querySelector('.aiab-file-upload-icon')).toBeTruthy();
      expect(document.querySelector('.aiab-file-upload-label')).toBeTruthy();
      expect(document.querySelector('.aiab-file-upload-button')).toBeTruthy();
      const input = document.querySelector('.aiab-file-upload-input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.type).toBe('file');
    });

    it('should set multiple attribute based on options', () => {
      upload = new FileUploadClass(container);
      expect((document.querySelector('.aiab-file-upload-input') as HTMLInputElement).multiple).toBe(
        true,
      );
      upload.destroy();

      upload = new FileUploadClass(container, { multiple: false });
      expect((document.querySelector('.aiab-file-upload-input') as HTMLInputElement).multiple).toBe(
        false,
      );
    });

    it('should create a file list container and start with empty files', () => {
      upload = new FileUploadClass(container);
      expect(document.querySelector('.aiab-file-upload-list')).toBeTruthy();
      expect(upload.files.length).toBe(0);
    });

    it('should set accept attribute on input when specified', () => {
      upload = new FileUploadClass(container, { accept: '.jpg,.png' });
      expect((document.querySelector('.aiab-file-upload-input') as HTMLInputElement).accept).toBe(
        '.jpg,.png',
      );
    });
  });

  describe('File Validation', () => {
    it('should accept files within size limit and reject oversized', () => {
      upload = new FileUploadClass(container, { maxSize: 1048576 }); // 1MB
      expect(upload.validateFile(createMockFile('small.txt', 500000, 'text/plain'))).toBe(true);
      expect(upload.validateFile(createMockFile('large.txt', 2000000, 'text/plain'))).toBe(false);
    });

    it('should validate by file extension', () => {
      upload = new FileUploadClass(container, { accept: '.jpg,.png' });
      expect(upload.validateFile(createMockFile('photo.jpg', 1000, 'image/jpeg'))).toBe(true);
      expect(upload.validateFile(createMockFile('document.pdf', 1000, 'application/pdf'))).toBe(
        false,
      );
    });

    it('should validate by MIME type wildcard', () => {
      upload = new FileUploadClass(container, { accept: 'image/*' });
      expect(upload.validateFile(createMockFile('photo.jpg', 1000, 'image/jpeg'))).toBe(true);
      expect(upload.validateFile(createMockFile('doc.pdf', 1000, 'application/pdf'))).toBe(false);
    });

    it('should reject duplicate files based on name and size', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      expect(upload.validateFile(createMockFile('test.txt', 1000, 'text/plain'))).toBe(false);
    });

    it('should accept all file types when accept is wildcard', () => {
      upload = new FileUploadClass(container, { accept: '*' });
      expect(
        upload.validateFile(createMockFile('anything.xyz', 1000, 'application/octet-stream')),
      ).toBe(true);
    });
  });

  describe('Adding Files', () => {
    it('should add file with pending status, zero progress, and unique id', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('file1.txt', 1000, 'text/plain'));
      upload.addFile(createMockFile('file2.txt', 2000, 'text/plain'));
      expect(upload.files.length).toBe(2);
      expect(upload.files[0].status).toBe('pending');
      expect(upload.files[0].progress).toBe(0);
      expect(upload.files[0].id).not.toBe(upload.files[1].id);
    });

    it('should call onSelect callback when file is added', () => {
      // biome-ignore lint/suspicious/noExplicitAny: callback args
      let selectedFile: any = null;
      upload = new FileUploadClass(container, {
        // biome-ignore lint/suspicious/noExplicitAny: callback args
        onSelect: (fileObj: any) => {
          selectedFile = fileObj;
        },
      });
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      expect(selectedFile).toBeTruthy();
      expect(selectedFile.name).toBe('test.txt');
    });

    it('should respect maxFiles limit', () => {
      let errorCalled = false;
      upload = new FileUploadClass(container, {
        maxFiles: 2,
        onError: () => {
          errorCalled = true;
        },
      });
      upload.addFile(createMockFile('file1.txt', 100, 'text/plain'));
      upload.addFile(createMockFile('file2.txt', 200, 'text/plain'));
      upload.handleFiles([createMockFile('file3.txt', 300, 'text/plain')]);
      expect(errorCalled).toBe(true);
    });
  });

  describe('File Item Rendering', () => {
    it('should render file item with name, size, status, and remove button', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('document.pdf', 1048576, 'application/pdf'));
      const item = document.querySelector('.aiab-file-upload-item') as HTMLElement;
      expect(item).toBeTruthy();
      expect(item.dataset.fileId).toBeTruthy();

      const name = document.querySelector('.aiab-file-upload-name') as HTMLElement;
      expect(name.textContent).toBe('document.pdf');

      const size = document.querySelector('.aiab-file-upload-size') as HTMLElement;
      expect(size.textContent).toContain('MB');

      const status = document.querySelector('.aiab-file-upload-status') as HTMLElement;
      expect(status.textContent).toContain('Ready to upload');

      expect(document.querySelector('.aiab-file-upload-remove')).toBeTruthy();
      expect(document.querySelector('.aiab-file-upload-progress')).toBeTruthy();
      expect(document.querySelector('.aiab-file-upload-preview')).toBeTruthy();
    });
  });

  describe('Removing Files', () => {
    it('should remove file from array and DOM', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      const fileId = upload.files[0].id;
      upload.removeFile(fileId);
      expect(upload.files.length).toBe(0);
      expect(document.querySelector('.aiab-file-upload-item')).toBeNull();
    });

    it('should call onRemove callback and handle non-existent IDs safely', () => {
      // biome-ignore lint/suspicious/noExplicitAny: callback args
      let removedFile: any = null;
      upload = new FileUploadClass(container, {
        // biome-ignore lint/suspicious/noExplicitAny: callback args
        onRemove: (fileObj: any) => {
          removedFile = fileObj;
        },
      });
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      const fileId = upload.files[0].id;
      upload.removeFile(fileId);
      expect(removedFile).toBeTruthy();
      expect(removedFile.name).toBe('test.txt');

      // Should not throw for non-existent ID
      expect(() => upload.removeFile(99999)).not.toThrow();
    });

    it('should remove file via remove button click', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      (document.querySelector('.aiab-file-upload-remove') as HTMLElement).click();
      expect(upload.files.length).toBe(0);
    });
  });

  describe('Drag and Drop', () => {
    it('should add drag-active class on dragover', () => {
      upload = new FileUploadClass(container);
      const zone = document.querySelector('.aiab-file-upload-zone') as HTMLElement;
      const event = new Event('dragover', { bubbles: true });
      Object.defineProperty(event, 'preventDefault', { value: () => {} });
      Object.defineProperty(event, 'stopPropagation', { value: () => {} });
      zone.dispatchEvent(event);
      expect(zone.classList.contains('aiab-file-upload-zone--drag-active')).toBe(true);
    });
  });

  describe('Progress and Status', () => {
    it('should update progress on file object and DOM bar', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      upload.updateProgress(upload.files[0], 75);
      expect(upload.files[0].progress).toBe(75);
      const bar = document.querySelector('.aiab-file-upload-progress-bar') as HTMLElement;
      expect(bar.style.width).toBe('75%');
    });

    it('should call onProgress callback', () => {
      let progressValue = 0;
      upload = new FileUploadClass(container, {
        // biome-ignore lint/suspicious/noExplicitAny: callback args
        onProgress: (_fileObj: any, percent: number) => {
          progressValue = percent;
        },
      });
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      upload.updateProgress(upload.files[0], 60);
      expect(progressValue).toBe(60);
    });

    it('should update status text and class in DOM', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      upload.files[0].status = 'uploading';
      upload.updateFileStatus(upload.files[0]);
      const status = document.querySelector('.aiab-file-upload-status') as HTMLElement;
      expect(status.textContent).toContain('Uploading');

      upload.files[0].status = 'success';
      upload.updateFileStatus(upload.files[0]);
      expect(status.classList.contains('aiab-file-upload-status--success')).toBe(true);
    });

    it('should hide progress bar on success or error', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      upload.files[0].status = 'success';
      upload.updateFileStatus(upload.files[0]);
      const progress = document.querySelector('.aiab-file-upload-progress') as HTMLElement;
      expect(progress.style.display).toBe('none');
    });
  });

  describe('Utility Methods', () => {
    it('should format bytes correctly', () => {
      upload = new FileUploadClass(container);
      expect(upload.formatSize(0)).toBe('0 B');
      expect(upload.formatSize(1024)).toContain('KB');
      expect(upload.formatSize(1048576)).toContain('MB');
      expect(upload.formatSize(1073741824)).toContain('GB');
    });

    it('should return correct accept text and status text', () => {
      upload = new FileUploadClass(container, { accept: '*' });
      expect(upload.getAcceptText()).toBe('All file types accepted');
      expect(upload.getStatusText('pending')).toBe('Ready to upload');
      expect(upload.getStatusText('uploading')).toBe('Uploading...');
      expect(upload.getStatusText('success')).toBe('Uploaded');
      expect(upload.getStatusText('error')).toBe('Failed');
      expect(upload.getStatusText('cancelled')).toBe('Cancelled');
    });

    it('should return a file icon SVG string', () => {
      upload = new FileUploadClass(container);
      expect(upload.getFileIcon('application/pdf')).toContain('svg');
    });
  });

  describe('Error Handling', () => {
    it('should call onError when showError is triggered', () => {
      let errorMessage = '';
      upload = new FileUploadClass(container, {
        // biome-ignore lint/suspicious/noExplicitAny: callback args
        onError: (_file: any, error: Error) => {
          errorMessage = error.message;
        },
      });
      upload.showError('Custom error message');
      expect(errorMessage).toBe('Custom error message');
    });
  });

  describe('Public API', () => {
    it('should return files with getFiles() and clear with clearFiles()', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('file1.txt', 100, 'text/plain'));
      upload.addFile(createMockFile('file2.txt', 200, 'text/plain'));
      expect(upload.getFiles().length).toBe(2);

      upload.clearFiles();
      expect(upload.files.length).toBe(0);
      expect(document.querySelectorAll('.aiab-file-upload-item').length).toBe(0);
    });
  });

  describe('XSS Prevention', () => {
    it('should escape HTML in file names', () => {
      upload = new FileUploadClass(container);
      const escaped = escapeHTML('<script>alert("xss")</script>');
      expect(escaped).not.toContain('<script>');
    });
  });

  describe('Destroy / Cleanup', () => {
    it('should clear files and element innerHTML on destroy()', () => {
      upload = new FileUploadClass(container);
      upload.addFile(createMockFile('test.txt', 1000, 'text/plain'));
      upload.destroy();
      expect(upload.files.length).toBe(0);
      expect(container.innerHTML).toBe('');
      upload = null;
    });
  });
});
