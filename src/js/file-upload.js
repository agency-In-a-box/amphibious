/**
 * File Upload Component JavaScript
 * Vanilla JS drag & drop file upload with previews
 * Part of Amphibious 2.0 Component Library
 */

import { escapeHTML } from '../utils/sanitize';

class FileUpload {
  constructor(element, options = {}) {
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
    };

    this.files = [];
    this.uploadQueue = [];
    this.isUploading = false;
    this._abortController = new AbortController();

    this.init();
  }

  init() {
    this.createUploadZone();
    this.bindEvents();
  }

  createUploadZone() {
    // Find or create upload zone
    let zone = this.element.querySelector('.aiab-file-upload-zone');
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
    let list = this.element.querySelector('.aiab-file-upload-list');
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

  bindEvents() {
    const signal = this._abortController.signal;

    // File input change
    this.input.addEventListener('change', (e) => this.handleFiles(e.target.files), { signal });

    // Click to open file dialog
    this.zone.addEventListener(
      'click',
      (e) => {
        if (e.target === this.button || e.target === this.zone) {
          this.input.click();
        }
      },
      { signal },
    );

    // Drag and drop events
    this.zone.addEventListener(
      'dragover',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.zone.classList.add('aiab-file-upload-zone--drag-active');
      },
      { signal },
    );

    this.zone.addEventListener(
      'dragleave',
      (e) => {
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
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.zone.classList.remove('aiab-file-upload-zone--drag-active');
        this.handleFiles(e.dataTransfer.files);
      },
      { signal },
    );

    // Prevent default drag over page
    document.addEventListener('dragover', (e) => e.preventDefault(), { signal });
    document.addEventListener(
      'drop',
      (e) => {
        if (!this.zone.contains(e.target)) {
          e.preventDefault();
        }
      },
      { signal },
    );
  }

  handleFiles(fileList) {
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
    files.forEach((file) => {
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

  validateFile(file) {
    // Check file size
    if (file.size > this.options.maxSize) {
      this.showError(
        `File "${file.name}" exceeds maximum size of ${this.formatSize(this.options.maxSize)}`,
      );
      return false;
    }

    // Check file type
    if (this.options.accept !== '*') {
      const accepts = this.options.accept.split(',').map((a) => a.trim());
      const isValid = accepts.some((accept) => {
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
    if (this.files.some((f) => f.name === file.name && f.size === file.size)) {
      this.showError(`File "${file.name}" already added`);
      return false;
    }

    return true;
  }

  addFile(file) {
    const fileObj = {
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

  renderFileItem(fileObj) {
    const item = document.createElement('div');
    item.className = 'aiab-file-upload-item';
    item.dataset.fileId = fileObj.id;

    // Create preview
    const preview = document.createElement('div');
    preview.className = 'aiab-file-upload-preview';

    if (this.options.preview && fileObj.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.alt = fileObj.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
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

  removeFile(fileId) {
    const index = this.files.findIndex((f) => f.id === fileId);
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

  uploadFile(fileObj) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', fileObj.file);

      const xhr = new XMLHttpRequest();
      fileObj.xhr = xhr;

      // Progress event
      xhr.upload.addEventListener('progress', (e) => {
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
      Object.keys(this.options.headers).forEach((key) => {
        xhr.setRequestHeader(key, this.options.headers[key]);
      });

      fileObj.status = 'uploading';
      this.updateFileStatus(fileObj);

      xhr.send(formData);
    });
  }

  updateProgress(fileObj, percent) {
    fileObj.progress = percent;

    const item = this.list.querySelector(`[data-file-id="${fileObj.id}"]`);
    if (item) {
      const bar = item.querySelector('.aiab-file-upload-progress-bar');
      if (bar) {
        bar.style.width = `${percent}%`;
      }
    }

    if (this.options.onProgress) {
      this.options.onProgress(fileObj, percent, this);
    }
  }

  updateFileStatus(fileObj) {
    const item = this.list.querySelector(`[data-file-id="${fileObj.id}"]`);
    if (item) {
      const status = item.querySelector('.aiab-file-upload-status');
      if (status) {
        status.className = `aiab-file-upload-status aiab-file-upload-status--${fileObj.status}`;
        status.textContent = this.getStatusText(fileObj.status);
      }

      // Hide progress bar when done
      if (fileObj.status === 'success' || fileObj.status === 'error') {
        const progress = item.querySelector('.aiab-file-upload-progress');
        if (progress) {
          progress.style.display = 'none';
        }
      }
    }
  }

  async uploadAll() {
    if (this.isUploading) return;

    const pendingFiles = this.files.filter((f) => f.status === 'pending');
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
          this.options.onError(fileObj, error, this);
        }
      }
    }

    this.isUploading = false;
  }

  // Utility methods
  formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
  }

  getAcceptText() {
    if (this.options.accept === '*') {
      return 'All file types accepted';
    }
    return `Accepted formats: ${this.options.accept}`;
  }

  getFileIcon(type) {
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

  getStatusText(status) {
    const statusTexts = {
      pending: 'Ready to upload',
      uploading: 'Uploading...',
      success: 'Uploaded',
      error: 'Failed',
      cancelled: 'Cancelled',
    };
    return statusTexts[status] || status;
  }

  showError(message) {
    // Custom error display - console removed for production
    // You can implement custom error display here

    if (this.options.onError) {
      this.options.onError(null, new Error(message), this);
    }
  }

  // Public API
  getFiles() {
    return this.files;
  }

  clearFiles() {
    this.files = [];
    this.list.innerHTML = '';
  }

  upload() {
    return this.uploadAll();
  }

  destroy() {
    this._abortController.abort();
    this.clearFiles();
    this.element.innerHTML = '';
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const uploads = document.querySelectorAll('[data-file-upload="true"]');
  uploads.forEach((element) => {
    new FileUpload(element);
  });
});

window.FileUpload = FileUpload;

export default FileUpload;
export { FileUpload };
