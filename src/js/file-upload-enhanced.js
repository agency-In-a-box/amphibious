/**
 * Enhanced File Upload Component JavaScript
 * Advanced drag & drop with chunked uploads, progress tracking, and complete cleanup
 * Part of Amphibious 2.0 Component Library
 */

class FileUploadEnhanced {
  constructor(element, options = {}) {
    this.element = element;

    // Memory management
    this.handlers = new Map();
    this.timers = new Set();
    this.createdElements = new Set();
    this.activeUploads = new Map();
    this.fileReaders = new Set();
    this.objectURLs = new Set();

    this.options = {
      // Basic options
      maxSize: options.maxSize || 10485760, // 10MB default
      maxFiles: options.maxFiles || null,
      accept: options.accept || '*',
      multiple: options.multiple !== false,
      preview: options.preview !== false,
      autoUpload: options.autoUpload || false,
      uploadUrl: options.uploadUrl || '/upload',

      // Advanced options
      chunked: options.chunked || false,
      chunkSize: options.chunkSize || 1048576, // 1MB chunks
      parallelUploads: options.parallelUploads || 3,
      retryCount: options.retryCount || 3,
      retryDelay: options.retryDelay || 1000,

      // Features
      dragAndDrop: options.dragAndDrop !== false,
      paste: options.paste || false,
      camera: options.camera || false,
      resumable: options.resumable || false,
      duplicateCheck: options.duplicateCheck !== false,

      // Image options
      imageResize: options.imageResize || false,
      maxImageWidth: options.maxImageWidth || 1920,
      maxImageHeight: options.maxImageHeight || 1080,
      imageQuality: options.imageQuality || 0.9,
      imageFormat: options.imageFormat || 'jpeg',

      // Validation
      validateFile: options.validateFile || null,
      allowedExtensions: options.allowedExtensions || null,
      blockedExtensions: options.blockedExtensions || null,

      // UI options
      thumbnailSize: options.thumbnailSize || 150,
      showFileList: options.showFileList !== false,
      sortable: options.sortable || false,
      theme: options.theme || 'light',

      // Request options
      headers: options.headers || {},
      withCredentials: options.withCredentials || false,
      timeout: options.timeout || 0,

      // Callbacks
      onSelect: options.onSelect || null,
      onBeforeUpload: options.onBeforeUpload || null,
      onUpload: options.onUpload || null,
      onProgress: options.onProgress || null,
      onError: options.onError || null,
      onRemove: options.onRemove || null,
      onComplete: options.onComplete || null,
      onRetry: options.onRetry || null,
      onChunkUpload: options.onChunkUpload || null,

      ...options
    };

    // State management
    this.state = {
      files: new Map(),
      queue: [],
      uploading: new Set(),
      completed: new Set(),
      failed: new Set(),
      paused: new Set(),
      totalProgress: 0,
      isDragging: false
    };

    // Statistics
    this.stats = {
      totalFiles: 0,
      totalSize: 0,
      uploadedSize: 0,
      startTime: null,
      endTime: null,
      successCount: 0,
      errorCount: 0
    };

    this.init();
  }

  init() {
    this.createUploadZone();
    this.bindEvents();

    if (this.options.sortable && this.options.showFileList) {
      this.initSortable();
    }

    if (this.options.resumable) {
      this.loadSavedUploads();
    }
  }

  createUploadZone() {
    // Create main wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'file-upload-enhanced';
    if (this.options.theme) {
      wrapper.classList.add(`file-upload-theme-${this.options.theme}`);
    }

    // Create drop zone
    const zone = document.createElement('div');
    zone.className = 'file-upload-zone';
    zone.setAttribute('role', 'button');
    zone.setAttribute('tabindex', '0');
    zone.setAttribute('aria-label', 'File upload area');

    // Icon
    const icon = document.createElement('div');
    icon.className = 'file-upload-icon';
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Text
    const label = document.createElement('div');
    label.className = 'file-upload-label';
    label.textContent = 'Drop files here or click to browse';

    // Description
    const description = document.createElement('div');
    description.className = 'file-upload-description';
    description.textContent = this.getAcceptText();

    // Input
    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'file-upload-input';
    input.multiple = this.options.multiple;
    if (this.options.accept !== '*') {
      input.accept = this.options.accept;
    }
    if (this.options.camera) {
      input.capture = 'environment';
    }

    // Buttons container
    const buttons = document.createElement('div');
    buttons.className = 'file-upload-buttons';

    // Browse button
    const browseBtn = document.createElement('button');
    browseBtn.type = 'button';
    browseBtn.className = 'file-upload-browse';
    browseBtn.textContent = 'Choose Files';

    // Camera button
    if (this.options.camera && this.hasCamera()) {
      const cameraBtn = document.createElement('button');
      cameraBtn.type = 'button';
      cameraBtn.className = 'file-upload-camera';
      cameraBtn.innerHTML = '📷 Take Photo';
      buttons.appendChild(cameraBtn);
      this.cameraBtn = cameraBtn;
    }

    buttons.appendChild(browseBtn);

    // Assemble zone
    zone.appendChild(icon);
    zone.appendChild(label);
    zone.appendChild(description);
    zone.appendChild(buttons);
    zone.appendChild(input);

    // File list container
    const fileList = document.createElement('div');
    fileList.className = 'file-upload-list';
    if (!this.options.showFileList) {
      fileList.style.display = 'none';
    }

    // Stats bar
    const statsBar = document.createElement('div');
    statsBar.className = 'file-upload-stats';
    statsBar.style.display = 'none';

    const statsText = document.createElement('div');
    statsText.className = 'file-upload-stats-text';

    const statsActions = document.createElement('div');
    statsActions.className = 'file-upload-stats-actions';

    // Upload all button
    const uploadAllBtn = document.createElement('button');
    uploadAllBtn.type = 'button';
    uploadAllBtn.className = 'file-upload-all';
    uploadAllBtn.textContent = 'Upload All';
    uploadAllBtn.style.display = 'none';

    // Clear all button
    const clearAllBtn = document.createElement('button');
    clearAllBtn.type = 'button';
    clearAllBtn.className = 'file-upload-clear';
    clearAllBtn.textContent = 'Clear All';
    clearAllBtn.style.display = 'none';

    statsActions.appendChild(uploadAllBtn);
    statsActions.appendChild(clearAllBtn);
    statsBar.appendChild(statsText);
    statsBar.appendChild(statsActions);

    // Assemble wrapper
    wrapper.appendChild(zone);
    wrapper.appendChild(statsBar);
    wrapper.appendChild(fileList);

    // Add to DOM
    this.element.appendChild(wrapper);

    // Store references
    this.wrapper = wrapper;
    this.zone = zone;
    this.input = input;
    this.browseBtn = browseBtn;
    this.fileList = fileList;
    this.statsBar = statsBar;
    this.statsText = statsText;
    this.uploadAllBtn = uploadAllBtn;
    this.clearAllBtn = clearAllBtn;

    this.createdElements.add(wrapper);
  }

  bindEvents() {
    // File input
    this.addHandler(this.input, 'change', (e) => {
      this.handleFiles(e.target.files);
      e.target.value = ''; // Reset input
    });

    // Browse button
    this.addHandler(this.browseBtn, 'click', () => {
      this.input.click();
    });

    // Zone click
    this.addHandler(this.zone, 'click', (e) => {
      if (e.target === this.zone || e.target.closest('.file-upload-icon, .file-upload-label')) {
        this.input.click();
      }
    });

    // Keyboard support
    this.addHandler(this.zone, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.input.click();
      }
    });

    // Drag and drop
    if (this.options.dragAndDrop) {
      this.setupDragAndDrop();
    }

    // Paste support
    if (this.options.paste) {
      this.setupPaste();
    }

    // Camera
    if (this.cameraBtn) {
      this.addHandler(this.cameraBtn, 'click', () => this.openCamera());
    }

    // Upload/Clear all
    this.addHandler(this.uploadAllBtn, 'click', () => this.uploadAll());
    this.addHandler(this.clearAllBtn, 'click', () => this.clearAll());

    // Window events
    this.addHandler(window, 'beforeunload', (e) => {
      if (this.state.uploading.size > 0) {
        e.preventDefault();
        e.returnValue = 'Files are still uploading. Are you sure you want to leave?';
      }
    });
  }

  setupDragAndDrop() {
    let dragCounter = 0;

    const dragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      if (dragCounter === 1) {
        this.state.isDragging = true;
        this.zone.classList.add('file-upload-zone--drag-active');
      }
    };

    const dragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        this.state.isDragging = false;
        this.zone.classList.remove('file-upload-zone--drag-active');
      }
    };

    const dragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const drop = (e) => {
      e.preventDefault();
      dragCounter = 0;
      this.state.isDragging = false;
      this.zone.classList.remove('file-upload-zone--drag-active');

      const items = e.dataTransfer.items;
      if (items) {
        this.handleDataTransferItems(items);
      } else {
        this.handleFiles(e.dataTransfer.files);
      }
    };

    this.addHandler(this.zone, 'dragenter', dragEnter);
    this.addHandler(this.zone, 'dragleave', dragLeave);
    this.addHandler(this.zone, 'dragover', dragOver);
    this.addHandler(this.zone, 'drop', drop);

    // Prevent default drag over page
    this.addHandler(document.body, 'dragover', (e) => e.preventDefault());
    this.addHandler(document.body, 'drop', (e) => {
      if (!this.zone.contains(e.target)) {
        e.preventDefault();
      }
    });
  }

  setupPaste() {
    const pasteHandler = (e) => {
      const items = e.clipboardData.items;
      const files = [];

      for (let item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        this.handleFiles(files);
      }
    };

    this.addHandler(document, 'paste', pasteHandler);
  }

  async handleDataTransferItems(items) {
    const entries = [];

    for (let item of items) {
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry) entries.push(entry);
      }
    }

    const files = await this.traverseFileTree(entries);
    this.handleFiles(files);
  }

  async traverseFileTree(entries) {
    const files = [];

    const traverse = async (entry) => {
      if (entry.isFile) {
        const file = await new Promise((resolve) => {
          entry.file(resolve);
        });
        files.push(file);
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await new Promise((resolve) => {
          reader.readEntries(resolve);
        });

        for (let childEntry of entries) {
          await traverse(childEntry);
        }
      }
    };

    for (let entry of entries) {
      await traverse(entry);
    }

    return files;
  }

  handleFiles(fileList) {
    const files = Array.from(fileList);

    // Check max files
    if (this.options.maxFiles) {
      const currentCount = this.state.files.size;
      const remaining = this.options.maxFiles - currentCount;

      if (remaining <= 0) {
        this.showError('Maximum number of files reached');
        return;
      }

      if (files.length > remaining) {
        files.splice(remaining);
        this.showError(`Only ${remaining} more file(s) can be added`);
      }
    }

    // Process each file
    files.forEach(file => {
      if (this.validateFile(file)) {
        this.addFile(file);
      }
    });

    // Auto upload
    if (this.options.autoUpload && this.state.queue.length > 0) {
      this.uploadAll();
    }
  }

  validateFile(file) {
    // Custom validator
    if (this.options.validateFile) {
      const result = this.options.validateFile(file);
      if (result !== true) {
        this.showError(result || `File "${file.name}" validation failed`);
        return false;
      }
    }

    // Size check
    if (file.size > this.options.maxSize) {
      this.showError(
        `File "${file.name}" exceeds maximum size of ${this.formatSize(this.options.maxSize)}`
      );
      return false;
    }

    // Type check
    if (!this.checkFileType(file)) {
      this.showError(`File type "${file.type || 'unknown'}" not allowed`);
      return false;
    }

    // Extension check
    const ext = file.name.split('.').pop().toLowerCase();

    if (this.options.allowedExtensions) {
      if (!this.options.allowedExtensions.includes(ext)) {
        this.showError(`File extension ".${ext}" not allowed`);
        return false;
      }
    }

    if (this.options.blockedExtensions) {
      if (this.options.blockedExtensions.includes(ext)) {
        this.showError(`File extension ".${ext}" is blocked`);
        return false;
      }
    }

    // Duplicate check
    if (this.options.duplicateCheck) {
      for (let [id, fileObj] of this.state.files) {
        if (fileObj.file.name === file.name &&
            fileObj.file.size === file.size &&
            fileObj.file.lastModified === file.lastModified) {
          this.showError(`File "${file.name}" already added`);
          return false;
        }
      }
    }

    return true;
  }

  checkFileType(file) {
    if (this.options.accept === '*') return true;

    const accepts = this.options.accept.split(',').map(a => a.trim());

    return accepts.some(accept => {
      if (accept.startsWith('.')) {
        return file.name.toLowerCase().endsWith(accept.toLowerCase());
      }
      if (accept.endsWith('/*')) {
        return file.type.startsWith(accept.slice(0, -2));
      }
      return file.type === accept;
    });
  }

  async addFile(file) {
    const id = this.generateId();

    // Process image if needed
    let processedFile = file;
    if (this.options.imageResize && file.type.startsWith('image/')) {
      processedFile = await this.resizeImage(file);
    }

    const fileObj = {
      id,
      file: processedFile,
      originalFile: file,
      name: file.name,
      size: processedFile.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      uploadedSize: 0,
      error: null,
      xhr: null,
      chunks: [],
      retries: 0,
      startTime: null,
      endTime: null,
      speed: 0,
      timeRemaining: null,
      thumbnail: null
    };

    // Generate thumbnail
    if (this.options.preview && file.type.startsWith('image/')) {
      fileObj.thumbnail = await this.generateThumbnail(file);
    }

    this.state.files.set(id, fileObj);
    this.state.queue.push(id);

    this.renderFileItem(fileObj);
    this.updateStats();

    if (this.options.onSelect) {
      this.options.onSelect(fileObj, this);
    }
  }

  async resizeImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      this.fileReaders.add(reader);

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let { width, height } = img;
          const maxWidth = this.options.maxImageWidth;
          const maxHeight = this.options.maxImageHeight;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const resizedFile = new File([blob], file.name, {
                type: `image/${this.options.imageFormat}`,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            },
            `image/${this.options.imageFormat}`,
            this.options.imageQuality
          );
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });
  }

  async generateThumbnail(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      this.fileReaders.add(reader);

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = this.options.thumbnailSize;

          // Calculate crop dimensions
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;

          canvas.width = size;
          canvas.height = size;

          ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);

          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });
  }

  renderFileItem(fileObj) {
    const item = document.createElement('div');
    item.className = 'file-upload-item';
    item.dataset.fileId = fileObj.id;

    // Preview
    const preview = document.createElement('div');
    preview.className = 'file-upload-preview';

    if (fileObj.thumbnail) {
      const img = document.createElement('img');
      img.src = fileObj.thumbnail;
      img.alt = fileObj.name;
      preview.appendChild(img);
    } else {
      preview.innerHTML = this.getFileIcon(fileObj.type);
    }

    // Info
    const info = document.createElement('div');
    info.className = 'file-upload-info';

    const name = document.createElement('div');
    name.className = 'file-upload-name';
    name.textContent = fileObj.name;
    name.title = fileObj.name;

    const meta = document.createElement('div');
    meta.className = 'file-upload-meta';

    const size = document.createElement('span');
    size.className = 'file-upload-size';
    size.textContent = this.formatSize(fileObj.size);

    const status = document.createElement('span');
    status.className = `file-upload-status file-upload-status--${fileObj.status}`;
    status.textContent = this.getStatusText(fileObj.status);

    const speed = document.createElement('span');
    speed.className = 'file-upload-speed';
    speed.style.display = 'none';

    meta.appendChild(size);
    meta.appendChild(status);
    meta.appendChild(speed);

    info.appendChild(name);
    info.appendChild(meta);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'file-upload-actions';

    // Upload button
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'file-upload-upload';
    uploadBtn.type = 'button';
    uploadBtn.innerHTML = '⬆';
    uploadBtn.title = 'Upload';

    // Pause button
    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'file-upload-pause';
    pauseBtn.type = 'button';
    pauseBtn.innerHTML = '⏸';
    pauseBtn.title = 'Pause';
    pauseBtn.style.display = 'none';

    // Retry button
    const retryBtn = document.createElement('button');
    retryBtn.className = 'file-upload-retry';
    retryBtn.type = 'button';
    retryBtn.innerHTML = '↻';
    retryBtn.title = 'Retry';
    retryBtn.style.display = 'none';

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'file-upload-remove';
    removeBtn.type = 'button';
    removeBtn.innerHTML = '×';
    removeBtn.title = 'Remove';

    actions.appendChild(uploadBtn);
    actions.appendChild(pauseBtn);
    actions.appendChild(retryBtn);
    actions.appendChild(removeBtn);

    // Progress bar
    const progress = document.createElement('div');
    progress.className = 'file-upload-progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'file-upload-progress-bar';
    progress.appendChild(progressBar);

    // Assemble item
    item.appendChild(preview);
    item.appendChild(info);
    item.appendChild(actions);
    item.appendChild(progress);

    // Bind item events
    this.addHandler(uploadBtn, 'click', () => this.uploadFile(fileObj.id));
    this.addHandler(pauseBtn, 'click', () => this.pauseUpload(fileObj.id));
    this.addHandler(retryBtn, 'click', () => this.retryUpload(fileObj.id));
    this.addHandler(removeBtn, 'click', () => this.removeFile(fileObj.id));

    this.fileList.appendChild(item);
    this.createdElements.add(item);
  }

  async uploadFile(fileId) {
    const fileObj = this.state.files.get(fileId);
    if (!fileObj || fileObj.status === 'uploading') return;

    // Before upload callback
    if (this.options.onBeforeUpload) {
      const result = await this.options.onBeforeUpload(fileObj, this);
      if (result === false) return;
    }

    fileObj.status = 'uploading';
    fileObj.startTime = Date.now();
    this.state.uploading.add(fileId);
    this.updateFileStatus(fileObj);

    try {
      if (this.options.chunked) {
        await this.uploadChunked(fileObj);
      } else {
        await this.uploadSimple(fileObj);
      }

      fileObj.status = 'success';
      fileObj.endTime = Date.now();
      this.state.completed.add(fileId);
      this.stats.successCount++;

      if (this.options.onUpload) {
        this.options.onUpload(fileObj, this);
      }
    } catch (error) {
      fileObj.status = 'error';
      fileObj.error = error.message;
      this.state.failed.add(fileId);
      this.stats.errorCount++;

      if (this.options.onError) {
        this.options.onError(fileObj, error, this);
      }

      // Auto retry
      if (fileObj.retries < this.options.retryCount) {
        fileObj.retries++;
        const delay = this.options.retryDelay * Math.pow(2, fileObj.retries - 1);

        const timer = setTimeout(() => {
          this.retryUpload(fileId);
        }, delay);

        this.timers.add(timer);
      }
    } finally {
      this.state.uploading.delete(fileId);
      this.updateFileStatus(fileObj);
      this.updateStats();

      // Check if all complete
      if (this.state.uploading.size === 0 && this.state.queue.length === 0) {
        if (this.options.onComplete) {
          this.options.onComplete(this.getFiles(), this);
        }
      }
    }
  }

  uploadSimple(fileObj) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      fileObj.xhr = xhr;
      this.activeUploads.set(fileObj.id, xhr);

      const formData = new FormData();
      formData.append('file', fileObj.file);

      // Progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          this.updateProgress(fileObj, percent, e.loaded);
        }
      });

      // Complete
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      // Error
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      // Abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Send
      xhr.open('POST', this.options.uploadUrl);

      // Headers
      Object.keys(this.options.headers).forEach(key => {
        xhr.setRequestHeader(key, this.options.headers[key]);
      });

      if (this.options.withCredentials) {
        xhr.withCredentials = true;
      }

      if (this.options.timeout) {
        xhr.timeout = this.options.timeout;
      }

      xhr.send(formData);
    });
  }

  async uploadChunked(fileObj) {
    const chunkSize = this.options.chunkSize;
    const totalChunks = Math.ceil(fileObj.file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      if (this.state.paused.has(fileObj.id)) {
        throw new Error('Upload paused');
      }

      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileObj.file.size);
      const chunk = fileObj.file.slice(start, end);

      await this.uploadChunk(fileObj, chunk, i, totalChunks);

      if (this.options.onChunkUpload) {
        this.options.onChunkUpload(fileObj, i + 1, totalChunks, this);
      }
    }
  }

  uploadChunk(fileObj, chunk, index, total) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append('chunk', chunk);
      formData.append('chunkIndex', index);
      formData.append('totalChunks', total);
      formData.append('fileName', fileObj.name);
      formData.append('fileId', fileObj.id);

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          fileObj.chunks[index] = true;
          resolve(xhr.response);
        } else {
          reject(new Error(`Chunk upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Chunk upload failed'));
      });

      xhr.open('POST', this.options.uploadUrl);

      Object.keys(this.options.headers).forEach(key => {
        xhr.setRequestHeader(key, this.options.headers[key]);
      });

      xhr.send(formData);
    });
  }

  pauseUpload(fileId) {
    const fileObj = this.state.files.get(fileId);
    if (!fileObj) return;

    if (fileObj.xhr) {
      fileObj.xhr.abort();
    }

    this.state.paused.add(fileId);
    fileObj.status = 'paused';
    this.updateFileStatus(fileObj);
  }

  retryUpload(fileId) {
    const fileObj = this.state.files.get(fileId);
    if (!fileObj) return;

    this.state.paused.delete(fileId);
    this.state.failed.delete(fileId);
    fileObj.status = 'pending';
    fileObj.error = null;

    this.updateFileStatus(fileObj);

    if (this.options.onRetry) {
      this.options.onRetry(fileObj, this);
    }

    this.uploadFile(fileId);
  }

  updateProgress(fileObj, percent, loaded) {
    fileObj.progress = percent;
    fileObj.uploadedSize = loaded;

    // Calculate speed
    const elapsed = Date.now() - fileObj.startTime;
    fileObj.speed = loaded / (elapsed / 1000);

    // Calculate time remaining
    const remaining = fileObj.size - loaded;
    fileObj.timeRemaining = remaining / fileObj.speed;

    // Update UI
    const item = this.fileList.querySelector(`[data-file-id="${fileObj.id}"]`);
    if (item) {
      const bar = item.querySelector('.file-upload-progress-bar');
      if (bar) {
        bar.style.width = `${percent}%`;
      }

      const speed = item.querySelector('.file-upload-speed');
      if (speed) {
        speed.style.display = 'inline';
        speed.textContent = `${this.formatSize(fileObj.speed)}/s`;
      }
    }

    // Update total progress
    this.updateTotalProgress();

    if (this.options.onProgress) {
      this.options.onProgress(fileObj, percent, this);
    }
  }

  updateFileStatus(fileObj) {
    const item = this.fileList.querySelector(`[data-file-id="${fileObj.id}"]`);
    if (!item) return;

    const status = item.querySelector('.file-upload-status');
    if (status) {
      status.className = `file-upload-status file-upload-status--${fileObj.status}`;
      status.textContent = this.getStatusText(fileObj.status);
    }

    // Update action buttons
    const uploadBtn = item.querySelector('.file-upload-upload');
    const pauseBtn = item.querySelector('.file-upload-pause');
    const retryBtn = item.querySelector('.file-upload-retry');

    uploadBtn.style.display = fileObj.status === 'pending' ? 'block' : 'none';
    pauseBtn.style.display = fileObj.status === 'uploading' ? 'block' : 'none';
    retryBtn.style.display = fileObj.status === 'error' ? 'block' : 'none';

    // Hide progress on success/error
    if (fileObj.status === 'success' || fileObj.status === 'error') {
      const progress = item.querySelector('.file-upload-progress');
      if (progress) {
        progress.style.display = 'none';
      }
    }
  }

  updateTotalProgress() {
    let totalSize = 0;
    let uploadedSize = 0;

    this.state.files.forEach(fileObj => {
      totalSize += fileObj.size;
      uploadedSize += fileObj.uploadedSize;
    });

    this.state.totalProgress = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0;
    this.stats.uploadedSize = uploadedSize;
  }

  updateStats() {
    const fileCount = this.state.files.size;

    if (fileCount > 0) {
      this.statsBar.style.display = 'flex';

      const pendingCount = Array.from(this.state.files.values())
        .filter(f => f.status === 'pending').length;

      this.statsText.textContent = `${fileCount} files (${this.formatSize(this.stats.totalSize)}) - ${pendingCount} pending`;

      this.uploadAllBtn.style.display = pendingCount > 0 ? 'block' : 'none';
      this.clearAllBtn.style.display = fileCount > 0 ? 'block' : 'none';
    } else {
      this.statsBar.style.display = 'none';
    }
  }

  removeFile(fileId) {
    const fileObj = this.state.files.get(fileId);
    if (!fileObj) return;

    // Cancel upload if in progress
    if (fileObj.xhr) {
      fileObj.xhr.abort();
    }

    // Clean up
    this.state.files.delete(fileId);
    this.state.queue = this.state.queue.filter(id => id !== fileId);
    this.state.uploading.delete(fileId);
    this.state.completed.delete(fileId);
    this.state.failed.delete(fileId);
    this.state.paused.delete(fileId);

    // Remove from DOM
    const item = this.fileList.querySelector(`[data-file-id="${fileId}"]`);
    if (item) {
      item.remove();
    }

    // Update stats
    this.stats.totalSize -= fileObj.size;
    this.updateStats();

    if (this.options.onRemove) {
      this.options.onRemove(fileObj, this);
    }
  }

  uploadAll() {
    const pendingFiles = Array.from(this.state.files.values())
      .filter(f => f.status === 'pending')
      .map(f => f.id);

    // Upload in parallel with limit
    const uploadNext = () => {
      while (this.state.uploading.size < this.options.parallelUploads && pendingFiles.length > 0) {
        const fileId = pendingFiles.shift();
        this.uploadFile(fileId).then(() => {
          uploadNext();
        });
      }
    };

    uploadNext();
  }

  clearAll() {
    // Cancel all uploads
    this.state.files.forEach(fileObj => {
      if (fileObj.xhr) {
        fileObj.xhr.abort();
      }
    });

    // Clear state
    this.state.files.clear();
    this.state.queue = [];
    this.state.uploading.clear();
    this.state.completed.clear();
    this.state.failed.clear();
    this.state.paused.clear();

    // Clear UI
    this.fileList.innerHTML = '';

    // Reset stats
    this.stats = {
      totalFiles: 0,
      totalSize: 0,
      uploadedSize: 0,
      startTime: null,
      endTime: null,
      successCount: 0,
      errorCount: 0
    };

    this.updateStats();
  }

  initSortable() {
    // Implementation depends on whether Sortable.js is available
    // This is a placeholder for sortable functionality
  }

  loadSavedUploads() {
    // Load resumable uploads from localStorage
    try {
      const saved = localStorage.getItem('amphibious-uploads');
      if (saved) {
        const uploads = JSON.parse(saved);
        // Restore upload state
      }
    } catch (e) {
      // Ignore errors
    }
  }

  saveUploads() {
    // Save resumable uploads to localStorage
    if (!this.options.resumable) return;

    try {
      const uploads = Array.from(this.state.files.values()).map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        chunks: f.chunks,
        progress: f.progress
      }));

      localStorage.setItem('amphibious-uploads', JSON.stringify(uploads));
    } catch (e) {
      // Ignore errors
    }
  }

  hasCamera() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Create camera modal
      const modal = document.createElement('div');
      modal.className = 'file-upload-camera-modal';

      const video = document.createElement('video');
      video.autoplay = true;
      video.srcObject = stream;

      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capture';
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob(blob => {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          this.handleFiles([file]);

          stream.getTracks().forEach(track => track.stop());
          modal.remove();
        });
      };

      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        modal.remove();
      };

      modal.appendChild(video);
      modal.appendChild(captureBtn);
      modal.appendChild(closeBtn);

      document.body.appendChild(modal);
      this.createdElements.add(modal);

    } catch (error) {
      this.showError('Camera access denied');
    }
  }

  // Helper methods
  getFileIcon(type) {
    const icons = {
      'image': '🖼️',
      'video': '🎥',
      'audio': '🎵',
      'application/pdf': '📄',
      'application/zip': '📦',
      'text': '📝'
    };

    for (let key in icons) {
      if (type.startsWith(key)) {
        return `<span class="file-upload-icon-emoji">${icons[key]}</span>`;
      }
    }

    return `<span class="file-upload-icon-emoji">📎</span>`;
  }

  getStatusText(status) {
    const texts = {
      pending: 'Ready',
      uploading: 'Uploading...',
      success: 'Complete',
      error: 'Failed',
      paused: 'Paused'
    };
    return texts[status] || status;
  }

  getAcceptText() {
    if (this.options.accept === '*') {
      return 'All file types accepted';
    }
    return `Accepted: ${this.options.accept}`;
  }

  formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
  }

  generateId() {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  showError(message) {
    if (this.options.onError) {
      this.options.onError(null, new Error(message), this);
    }
  }

  addHandler(element, event, handler) {
    element.addEventListener(event, handler);

    if (!this.handlers.has(element)) {
      this.handlers.set(element, []);
    }

    this.handlers.get(element).push({ event, handler });
  }

  // Public API
  getFiles() {
    return Array.from(this.state.files.values());
  }

  getFile(fileId) {
    return this.state.files.get(fileId);
  }

  addFiles(files) {
    this.handleFiles(files);
  }

  upload(fileId) {
    if (fileId) {
      this.uploadFile(fileId);
    } else {
      this.uploadAll();
    }
  }

  pause(fileId) {
    if (fileId) {
      this.pauseUpload(fileId);
    } else {
      this.state.uploading.forEach(id => this.pauseUpload(id));
    }
  }

  resume(fileId) {
    if (fileId) {
      this.state.paused.delete(fileId);
      this.uploadFile(fileId);
    } else {
      const paused = Array.from(this.state.paused);
      paused.forEach(id => {
        this.state.paused.delete(id);
        this.uploadFile(id);
      });
    }
  }

  remove(fileId) {
    if (fileId) {
      this.removeFile(fileId);
    } else {
      this.clearAll();
    }
  }

  /**
   * Comprehensive destroy method
   */
  destroy() {
    // Cancel all active uploads
    this.activeUploads.forEach(xhr => xhr.abort());
    this.activeUploads.clear();

    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // Remove all event listeners
    this.handlers.forEach((handlerList, element) => {
      handlerList.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.handlers.clear();

    // Abort all file readers
    this.fileReaders.forEach(reader => reader.abort());
    this.fileReaders.clear();

    // Revoke object URLs
    this.objectURLs.forEach(url => URL.revokeObjectURL(url));
    this.objectURLs.clear();

    // Remove created elements
    this.createdElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.createdElements.clear();

    // Clear state
    this.state.files.clear();
    this.state = null;
    this.stats = null;

    // Clear references
    this.element = null;
    this.wrapper = null;
    this.zone = null;
    this.input = null;
    this.browseBtn = null;
    this.cameraBtn = null;
    this.fileList = null;
    this.statsBar = null;
    this.statsText = null;
    this.uploadAllBtn = null;
    this.clearAllBtn = null;
    this.options = null;
  }
}

// Register with component registry if available
if (window.AmphibiousRegistry) {
  window.AmphibiousRegistry.registerComponent('file-upload', FileUploadEnhanced, {
    selector: '[data-file-upload]',
    autoInit: true
  });
}

// Export
window.FileUploadEnhanced = FileUploadEnhanced;
export default FileUploadEnhanced;