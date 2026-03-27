/**
 * File Upload Component TypeScript
 * Vanilla JS drag & drop file upload with previews
 * Part of Amphibious 2.0 Component Library
 *
 * @module file-upload
 */

import { escapeHTML } from '../utils/sanitize';

/** Status of an individual file in the upload queue. */
export type FileStatus = 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';

/**
 * Callback signatures used by FileUpload options.
 */
export type FileSelectCallback = (fileObj: FileEntry, uploader: FileUpload) => void;
export type FileUploadCallback = (
  fileObj: FileEntry,
  // biome-ignore lint/suspicious/noExplicitAny: server response shape is unknown
  response: any,
  uploader: FileUpload,
) => void;
export type FileProgressCallback = (
  fileObj: FileEntry,
  percent: number,
  uploader: FileUpload,
) => void;
export type FileErrorCallback = (
  fileObj: FileEntry | null,
  error: Error,
  uploader: FileUpload,
) => void;
export type FileRemoveCallback = (fileObj: FileEntry, uploader: FileUpload) => void;

/**
 * Configuration options for the FileUpload component.
 *
 * @property maxSize - Maximum file size in bytes. Defaults to `10485760` (10 MB).
 * @property maxFiles - Maximum number of files allowed. `null` means unlimited.
 * @property accept - Comma-separated accepted MIME types or extensions. `'*'` accepts all.
 * @property multiple - Whether the file input allows multiple files.
 * @property preview - Whether to generate image previews for image files.
 * @property autoUpload - Whether to start uploading immediately after file selection.
 * @property uploadUrl - Server endpoint for file uploads.
 * @property headers - Custom headers to include with upload requests.
 * @property onSelect - Callback fired when a file is added to the queue.
 * @property onUpload - Callback fired when a file upload completes successfully.
 * @property onProgress - Callback fired during upload progress.
 * @property onError - Callback fired on validation or upload errors.
 * @property onRemove - Callback fired when a file is removed from the queue.
 */
export interface FileUploadOptions {
  maxSize?: number;
  maxFiles?: number | null;
  accept?: string;
  multiple?: boolean;
  preview?: boolean;
  autoUpload?: boolean;
  uploadUrl?: string;
  headers?: Record<string, string>;
  onSelect?: FileSelectCallback | null;
  onUpload?: FileUploadCallback | null;
  onProgress?: FileProgressCallback | null;
  onError?: FileErrorCallback | null;
  onRemove?: FileRemoveCallback | null;
}

/** Resolved internal options with all defaults applied. */
interface ResolvedFileUploadOptions {
  maxSize: number;
  maxFiles: number | null;
  accept: string;
  multiple: boolean;
  preview: boolean;
  autoUpload: boolean;
  uploadUrl: string;
  headers: Record<string, string>;
  onSelect: FileSelectCallback | null;
  onUpload: FileUploadCallback | null;
  onProgress: FileProgressCallback | null;
  onError: FileErrorCallback | null;
  onRemove: FileRemoveCallback | null;
}

/**
 * Internal representation of a file in the upload queue.
 *
 * @property id - Unique identifier for this entry.
 * @property file - The native File object.
 * @property name - File name.
 * @property size - File size in bytes.
 * @property type - MIME type.
 * @property status - Current upload status.
 * @property progress - Upload progress percentage (0-100).
 * @property error - Error message if the upload failed.
 * @property xhr - The XMLHttpRequest used for uploading (set during upload).
 */
export interface FileEntry {
  id: number;
  file: File;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
  progress: number;
  error: string | null;
  xhr?: XMLHttpRequest;
}

/**
 * Drag & drop file upload component with previews, validation,
 * progress tracking, and XHR-based upload support.
 *
 * Uses an `AbortController` for centralized event listener cleanup on {@link destroy}.
 *
 * @example
 * ```ts
 * const upload = new FileUpload(document.getElementById('upload')!, {
 *   maxSize: 5 * 1024 * 1024,
 *   accept: 'image/*',
 *   autoUpload: true,
 *   uploadUrl: '/api/upload',
 *   onUpload: (fileObj, response) => console.log('Uploaded:', fileObj.name),
 * });
 * ```
 */
class FileUpload {
  public element: HTMLElement;
  public options: ResolvedFileUploadOptions;
  public files: FileEntry[];
  public uploadQueue: FileEntry[];
  public isUploading: boolean;

  private _abortController: AbortController;
  private zone!: HTMLElement;
  private input!: HTMLInputElement;
  private list!: HTMLElement;
  private button!: HTMLButtonElement | null;

  constructor(element: HTMLElement, options: FileUploadOptions = {}) {
    this.element = element;
    this.options = {
      maxSize: options.maxSize || 10485760, // 10MB default
      maxFiles: options.maxFiles || null,
      accept: options.accept || '*',
      multiple: options.multiple !== false,
      preview: options.preview !== false,
      autoUpload: options.autoUpload || false,
      uploadUrl: options.uploadUrl || '/upload',
      headers: options.headers || {},
      onSelect: options.onSelect || null,
      onUpload: options.onUpload || null,
      onProgress: options.onProgress || null,
      onError: options.onError || null,
      onRemove: options.onRemove || null,
      ...options,
    } as ResolvedFileUploadOptions;

    this.files = [];
    this.uploadQueue = [];
    this.isUploading = false;
    this._abortController = new AbortController();

    this.init();
  }

  private init(): void {
    this.createUploadZone();
    this.bindEvents();
  }

  private createUploadZone(): void {
    // Find or create upload zone
    let zone = this.element.querySelector('.aiab-file-upload-zone') as HTMLElement | null;
    if (!zone) {
      zone = document.createElement('div');
      zone.className = 'aiab-file-upload-zone';
      zone.innerHTML = `
        <svg class="aiab-file-upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <div class="aiab-file-upload-label">Drop files here or click to browse</div>
        <div class="aiab-file-upload-description">
          ${this.getAcceptText()}
        </div>
        <button type="button" class="aiab-file-upload-button">Choose Files</button>
        <div class="aiab-file-upload-formats">Maximum file size: ${this.formatSize(this.options.maxSize)}</div>
      `;
      this.element.appendChild(zone);
    }

    // Create hidden input
    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'aiab-file-upload-input';
    input.multiple = this.options.multiple;
    if (this.options.accept !== '*') {
      input.accept = this.options.accept;
    }
    zone.appendChild(input);

    // Create file list container
    let list = this.element.querySelector('.aiab-file-upload-list') as HTMLElement | null;
    if (!list) {
      list = document.createElement('div');
      list.className = 'aiab-file-upload-list';
      this.element.appendChild(list);
    }

    this.zone = zone;
    this.input = input;
    this.list = list;
    this.button = zone.querySelector('.aiab-file-upload-button');
  }

  private bindEvents(): void {
    const signal = this._abortController.signal;

    // File input change
    this.input.addEventListener(
      'change',
      (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          this.handleFiles(target.files);
        }
      },
      { signal },
    );

    // Click to open file dialog
    this.zone.addEventListener(
      'click',
      (e: MouseEvent) => {
        if (e.target === this.button || e.target === this.zone) {
          this.input.click();
        }
      },
      { signal },
    );

    // Drag and drop events
    this.zone.addEventListener(
      'dragover',
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.zone.classList.add('aiab-file-upload-zone--drag-active');
      },
      { signal },
    );

    this.zone.addEventListener(
      'dragleave',
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target === this.zone) {
          this.zone.classList.remove('aiab-file-upload-zone--drag-active');
        }
      },
      { signal },
    );

    this.zone.addEventListener(
      'drop',
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.zone.classList.remove('aiab-file-upload-zone--drag-active');
        if (e.dataTransfer) {
          this.handleFiles(e.dataTransfer.files);
        }
      },
      { signal },
    );

    // Prevent default drag over page
    document.addEventListener('dragover', (e: DragEvent) => e.preventDefault(), { signal });
    document.addEventListener(
      'drop',
      (e: DragEvent) => {
        if (!this.zone.contains(e.target as Node)) {
          e.preventDefault();
        }
      },
      { signal },
    );
  }

  private handleFiles(fileList: FileList): void {
    const files = Array.from(fileList);

    // Check max files
    if (this.options.maxFiles) {
      const remaining = this.options.maxFiles - this.files.length;
      if (remaining <= 0) {
        this.showError('Maximum number of files reached');
        return;
      }
      files.splice(remaining);
    }

    // Validate and add files
    files.forEach((file: File) => {
      if (this.validateFile(file)) {
        this.addFile(file);
      }
    });

    // Clear input
    this.input.value = '';

    // Auto upload if enabled
    if (this.options.autoUpload) {
      this.uploadAll();
    }
  }

  private validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.options.maxSize) {
      this.showError(
        `File "${file.name}" exceeds maximum size of ${this.formatSize(this.options.maxSize)}`,
      );
      return false;
    }

    // Check file type
    if (this.options.accept !== '*') {
      const accepts = this.options.accept.split(',').map((a: string) => a.trim());
      const isValid = accepts.some((accept: string) => {
        if (accept.startsWith('.')) {
          return file.name.toLowerCase().endsWith(accept.toLowerCase());
        }
        if (accept.endsWith('/*')) {
          return file.type.startsWith(accept.slice(0, -2));
        }
        return file.type === accept;
      });

      if (!isValid) {
        this.showError(`File "${file.name}" type not allowed`);
        return false;
      }
    }

    // Check duplicates
    if (this.files.some((f: FileEntry) => f.name === file.name && f.size === file.size)) {
      this.showError(`File "${file.name}" already added`);
      return false;
    }

    return true;
  }

  private addFile(file: File): void {
    const fileObj: FileEntry = {
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      error: null,
    };

    this.files.push(fileObj);
    this.renderFileItem(fileObj);

    if (this.options.onSelect) {
      this.options.onSelect(fileObj, this);
    }
  }

  private renderFileItem(fileObj: FileEntry): void {
    const item = document.createElement('div');
    item.className = 'aiab-file-upload-item';
    item.dataset.fileId = String(fileObj.id);

    // Create preview
    const preview = document.createElement('div');
    preview.className = 'aiab-file-upload-preview';

    if (this.options.preview && fileObj.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.alt = fileObj.name;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(fileObj.file);

      preview.appendChild(img);
    } else {
      preview.innerHTML = this.getFileIcon(fileObj.type);
    }

    // Create info
    const info = document.createElement('div');
    info.className = 'aiab-file-upload-info';
    info.innerHTML = `
      <div class="aiab-file-upload-name">${escapeHTML(fileObj.name)}</div>
      <div class="aiab-file-upload-meta">
        <span class="aiab-file-upload-size">${this.formatSize(fileObj.size)}</span>
        <span class="aiab-file-upload-status aiab-file-upload-status--${fileObj.status}">
          ${this.getStatusText(fileObj.status)}
        </span>
      </div>
    `;

    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'aiab-file-upload-remove';
    removeBtn.type = 'button';
    removeBtn.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
    removeBtn.addEventListener('click', () => this.removeFile(fileObj.id));

    // Create progress bar
    const progress = document.createElement('div');
    progress.className = 'aiab-file-upload-progress';
    progress.innerHTML = '<div class="aiab-file-upload-progress-bar" style="width: 0%"></div>';

    item.appendChild(preview);
    item.appendChild(info);
    item.appendChild(removeBtn);
    item.appendChild(progress);

    this.list.appendChild(item);
  }

  public removeFile(fileId: number): void {
    const index = this.files.findIndex((f: FileEntry) => f.id === fileId);
    if (index > -1) {
      const fileObj = this.files[index];

      // Cancel upload if in progress
      if (fileObj.xhr) {
        fileObj.xhr.abort();
      }

      // Remove from array
      this.files.splice(index, 1);

      // Remove from DOM
      const item = this.list.querySelector(`[data-file-id="${fileId}"]`);
      if (item) {
        item.remove();
      }

      // Callback
      if (this.options.onRemove) {
        this.options.onRemove(fileObj, this);
      }
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: server response shape is unknown
  private uploadFile(fileObj: FileEntry): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', fileObj.file);

      const xhr = new XMLHttpRequest();
      fileObj.xhr = xhr;

      // Progress event
      xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          this.updateProgress(fileObj, percent);
        }
      });

      // Load event
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          fileObj.status = 'success';
          this.updateFileStatus(fileObj);
          resolve(xhr.response);
        } else {
          fileObj.status = 'error';
          fileObj.error = `Upload failed: ${xhr.statusText}`;
          this.updateFileStatus(fileObj);
          reject(new Error(fileObj.error));
        }
      });

      // Error event
      xhr.addEventListener('error', () => {
        fileObj.status = 'error';
        fileObj.error = 'Upload failed';
        this.updateFileStatus(fileObj);
        reject(new Error(fileObj.error));
      });

      // Abort event
      xhr.addEventListener('abort', () => {
        fileObj.status = 'cancelled';
        this.updateFileStatus(fileObj);
        reject(new Error('Upload cancelled'));
      });

      // Send request
      xhr.open('POST', this.options.uploadUrl);

      // Add custom headers
      Object.keys(this.options.headers).forEach((key: string) => {
        xhr.setRequestHeader(key, this.options.headers[key]);
      });

      fileObj.status = 'uploading';
      this.updateFileStatus(fileObj);

      xhr.send(formData);
    });
  }

  private updateProgress(fileObj: FileEntry, percent: number): void {
    fileObj.progress = percent;

    const item = this.list.querySelector(`[data-file-id="${fileObj.id}"]`);
    if (item) {
      const bar = item.querySelector('.aiab-file-upload-progress-bar') as HTMLElement | null;
      if (bar) {
        bar.style.width = `${percent}%`;
      }
    }

    if (this.options.onProgress) {
      this.options.onProgress(fileObj, percent, this);
    }
  }

  private updateFileStatus(fileObj: FileEntry): void {
    const item = this.list.querySelector(`[data-file-id="${fileObj.id}"]`);
    if (item) {
      const status = item.querySelector('.aiab-file-upload-status');
      if (status) {
        status.className = `aiab-file-upload-status aiab-file-upload-status--${fileObj.status}`;
        status.textContent = this.getStatusText(fileObj.status);
      }

      // Hide progress bar when done
      if (fileObj.status === 'success' || fileObj.status === 'error') {
        const progress = item.querySelector('.aiab-file-upload-progress') as HTMLElement | null;
        if (progress) {
          progress.style.display = 'none';
        }
      }
    }
  }

  public async uploadAll(): Promise<void> {
    if (this.isUploading) return;

    const pendingFiles = this.files.filter((f: FileEntry) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    this.isUploading = true;

    for (const fileObj of pendingFiles) {
      try {
        const response = await this.uploadFile(fileObj);

        if (this.options.onUpload) {
          this.options.onUpload(fileObj, response, this);
        }
      } catch (error) {
        if (this.options.onError) {
          this.options.onError(fileObj, error as Error, this);
        }
      }
    }

    this.isUploading = false;
  }

  // Utility methods
  private formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
  }

  private getAcceptText(): string {
    if (this.options.accept === '*') {
      return 'All file types accepted';
    }
    return `Accepted formats: ${this.options.accept}`;
  }

  private getFileIcon(type: string): string {
    let _icon = 'file';
    let className = '';

    if (type.startsWith('image/')) {
      _icon = 'photograph';
    } else if (type.startsWith('video/')) {
      _icon = 'film';
      className = 'aiab-file-type-video';
    } else if (type.startsWith('audio/')) {
      _icon = 'music-note';
      className = 'aiab-file-type-audio';
    } else if (type === 'application/pdf') {
      _icon = 'document';
      className = 'aiab-file-type-pdf';
    } else if (type.includes('zip') || type.includes('rar')) {
      _icon = 'archive';
      className = 'aiab-file-type-zip';
    } else if (type.includes('word') || type.includes('document')) {
      _icon = 'document-text';
      className = 'aiab-file-type-doc';
    } else if (type.includes('sheet') || type.includes('excel')) {
      _icon = 'table';
      className = 'aiab-file-type-xls';
    }

    return `
      <svg class="aiab-file-upload-preview-icon ${className}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    `;
  }

  private getStatusText(status: FileStatus): string {
    const statusTexts: Record<FileStatus, string> = {
      pending: 'Ready to upload',
      uploading: 'Uploading...',
      success: 'Uploaded',
      error: 'Failed',
      cancelled: 'Cancelled',
    };
    return statusTexts[status] || status;
  }

  private showError(message: string): void {
    // Custom error display - console removed for production
    // You can implement custom error display here

    if (this.options.onError) {
      this.options.onError(null, new Error(message), this);
    }
  }

  // Public API
  public getFiles(): FileEntry[] {
    return this.files;
  }

  public clearFiles(): void {
    this.files = [];
    this.list.innerHTML = '';
  }

  public upload(): Promise<void> {
    return this.uploadAll();
  }

  public destroy(): void {
    this._abortController.abort();
    this.clearFiles();
    this.element.innerHTML = '';
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  try {
    const uploads = document.querySelectorAll('[data-file-upload="true"]');
    uploads.forEach((element: Element) => {
      new FileUpload(element as HTMLElement);
    });
  } catch (error) {
    console.error('[Amphibious] FileUpload auto-init failed:', error);
  }
});

// biome-ignore lint/suspicious/noExplicitAny: global window assignment for non-module consumers
(window as any).FileUpload = FileUpload;

export default FileUpload;
export { FileUpload };
