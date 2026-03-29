/**
 * Enhanced File Upload Component TypeScript
 * Advanced drag & drop with chunked uploads, progress tracking, and complete cleanup
 * Part of Amphibious 2.0 Component Library
 *
 * @module file-upload-enhanced
 */

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/** Status of an individual file in the enhanced upload queue. */
export type EnhancedFileStatus = 'pending' | 'uploading' | 'success' | 'error' | 'paused';

/** Image output format for resize operations. */
export type ImageFormat = 'jpeg' | 'png' | 'webp';

/** UI theme for the upload component. */
export type UploadTheme = 'light' | 'dark' | string;

/**
 * Callback signatures used by FileUploadEnhanced options.
 */
export type EnhancedSelectCallback = (
  fileObj: EnhancedFileEntry,
  uploader: FileUploadEnhanced,
) => void;

export type EnhancedBeforeUploadCallback = (
  fileObj: EnhancedFileEntry,
  uploader: FileUploadEnhanced,
) => boolean | Promise<boolean | void> | void;

export type EnhancedUploadCallback = (
  fileObj: EnhancedFileEntry,
  uploader: FileUploadEnhanced,
) => void;

export type EnhancedProgressCallback = (
  fileObj: EnhancedFileEntry,
  percent: number,
  uploader: FileUploadEnhanced,
) => void;

export type EnhancedErrorCallback = (
  fileObj: EnhancedFileEntry | null,
  error: Error,
  uploader: FileUploadEnhanced,
) => void;

export type EnhancedRemoveCallback = (
  fileObj: EnhancedFileEntry,
  uploader: FileUploadEnhanced,
) => void;

export type EnhancedCompleteCallback = (
  files: EnhancedFileEntry[],
  uploader: FileUploadEnhanced,
) => void;

export type EnhancedRetryCallback = (
  fileObj: EnhancedFileEntry,
  uploader: FileUploadEnhanced,
) => void;

export type EnhancedChunkUploadCallback = (
  fileObj: EnhancedFileEntry,
  chunkNumber: number,
  totalChunks: number,
  uploader: FileUploadEnhanced,
) => void;

export type FileValidateCallback = (file: File) => true | string;

/** I18n label overrides for the enhanced upload UI. */
export interface EnhancedUploadLabels {
  dropZone?: string;
  fileUploadArea?: string;
  chooseFiles?: string;
  takePhoto?: string;
  uploadAll?: string;
  clearAll?: string;
  capture?: string;
  close?: string;
  upload?: string;
  pause?: string;
  retry?: string;
  remove?: string;
  statusReady?: string;
  statusUploading?: string;
  statusComplete?: string;
  statusFailed?: string;
  statusPaused?: string;
  allTypesAccepted?: string;
  acceptedTypes?: (types: string) => string;
  statsText?: (count: number, size: string, pending: number) => string;
  maxFilesReached?: string;
  maxFilesRemaining?: (remaining: number) => string;
  validationFailed?: (name: string) => string;
  fileTooLarge?: (name: string, maxSize: string) => string;
  typeNotAllowed?: (type: string) => string;
  extensionNotAllowed?: (ext: string) => string;
  extensionBlocked?: (ext: string) => string;
  duplicateFile?: (name: string) => string;
  cameraAccessDenied?: string;
  uploadInProgress?: string;
}

/** Fully resolved label set where every field has a value. */
interface ResolvedLabels {
  dropZone: string;
  fileUploadArea: string;
  chooseFiles: string;
  takePhoto: string;
  uploadAll: string;
  clearAll: string;
  capture: string;
  close: string;
  upload: string;
  pause: string;
  retry: string;
  remove: string;
  statusReady: string;
  statusUploading: string;
  statusComplete: string;
  statusFailed: string;
  statusPaused: string;
  allTypesAccepted: string;
  acceptedTypes: (types: string) => string;
  statsText: (count: number, size: string, pending: number) => string;
  maxFilesReached: string;
  maxFilesRemaining: (remaining: number) => string;
  validationFailed: (name: string) => string;
  fileTooLarge: (name: string, maxSize: string) => string;
  typeNotAllowed: (type: string) => string;
  extensionNotAllowed: (ext: string) => string;
  extensionBlocked: (ext: string) => string;
  duplicateFile: (name: string) => string;
  cameraAccessDenied: string;
  uploadInProgress: string;
}

/**
 * Public configuration options for FileUploadEnhanced.
 * All properties are optional; sensible defaults are applied internally.
 */
export interface FileUploadEnhancedOptions {
  // Basic
  maxSize?: number;
  maxFiles?: number | null;
  accept?: string;
  multiple?: boolean;
  preview?: boolean;
  autoUpload?: boolean;
  uploadUrl?: string;

  // Advanced
  chunked?: boolean;
  chunkSize?: number;
  parallelUploads?: number;
  retryCount?: number;
  retryDelay?: number;

  // Features
  dragAndDrop?: boolean;
  paste?: boolean;
  camera?: boolean;
  resumable?: boolean;
  duplicateCheck?: boolean;

  // Image options
  imageResize?: boolean;
  maxImageWidth?: number;
  maxImageHeight?: number;
  imageQuality?: number;
  imageFormat?: ImageFormat;

  // Validation
  validateFile?: FileValidateCallback | null;
  allowedExtensions?: string[] | null;
  blockedExtensions?: string[] | null;

  // UI
  thumbnailSize?: number;
  showFileList?: boolean;
  sortable?: boolean;
  theme?: UploadTheme;

  // Request
  headers?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;

  // Labels (i18n)
  labels?: EnhancedUploadLabels;

  // Callbacks
  onSelect?: EnhancedSelectCallback | null;
  onBeforeUpload?: EnhancedBeforeUploadCallback | null;
  onUpload?: EnhancedUploadCallback | null;
  onProgress?: EnhancedProgressCallback | null;
  onError?: EnhancedErrorCallback | null;
  onRemove?: EnhancedRemoveCallback | null;
  onComplete?: EnhancedCompleteCallback | null;
  onRetry?: EnhancedRetryCallback | null;
  onChunkUpload?: EnhancedChunkUploadCallback | null;
}

/** Resolved internal options with all defaults applied. */
interface ResolvedOptions {
  maxSize: number;
  maxFiles: number | null;
  accept: string;
  multiple: boolean;
  preview: boolean;
  autoUpload: boolean;
  uploadUrl: string;

  chunked: boolean;
  chunkSize: number;
  parallelUploads: number;
  retryCount: number;
  retryDelay: number;

  dragAndDrop: boolean;
  paste: boolean;
  camera: boolean;
  resumable: boolean;
  duplicateCheck: boolean;

  imageResize: boolean;
  maxImageWidth: number;
  maxImageHeight: number;
  imageQuality: number;
  imageFormat: ImageFormat;

  validateFile: FileValidateCallback | null;
  allowedExtensions: string[] | null;
  blockedExtensions: string[] | null;

  thumbnailSize: number;
  showFileList: boolean;
  sortable: boolean;
  theme: UploadTheme;

  headers: Record<string, string>;
  withCredentials: boolean;
  timeout: number;

  labels: ResolvedLabels;

  onSelect: EnhancedSelectCallback | null;
  onBeforeUpload: EnhancedBeforeUploadCallback | null;
  onUpload: EnhancedUploadCallback | null;
  onProgress: EnhancedProgressCallback | null;
  onError: EnhancedErrorCallback | null;
  onRemove: EnhancedRemoveCallback | null;
  onComplete: EnhancedCompleteCallback | null;
  onRetry: EnhancedRetryCallback | null;
  onChunkUpload: EnhancedChunkUploadCallback | null;
}

/**
 * Internal representation of a file in the enhanced upload queue.
 */
export interface EnhancedFileEntry {
  id: string;
  file: File;
  originalFile: File;
  name: string;
  size: number;
  type: string;
  status: EnhancedFileStatus;
  progress: number;
  uploadedSize: number;
  error: string | null;
  xhr: XMLHttpRequest | null;
  chunks: boolean[];
  retries: number;
  startTime: number | null;
  endTime: number | null;
  speed: number;
  timeRemaining: number | null;
  thumbnail: string | null;
}

/** Internal component state. */
interface UploadState {
  files: Map<string, EnhancedFileEntry>;
  queue: string[];
  uploading: Set<string>;
  completed: Set<string>;
  failed: Set<string>;
  paused: Set<string>;
  totalProgress: number;
  isDragging: boolean;
}

/** Upload statistics. */
interface UploadStats {
  totalFiles: number;
  totalSize: number;
  uploadedSize: number;
  startTime: number | null;
  endTime: number | null;
  successCount: number;
  errorCount: number;
}

/** Saved upload entry for resumable uploads. */
interface SavedUploadEntry {
  id: string;
  name: string;
  size: number;
  type: string;
  chunks: boolean[];
  progress: number;
}

/** Event handler record stored for cleanup. */
interface HandlerRecord {
  event: string;
  handler: EventListener;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Advanced drag & drop file upload with chunked uploads, image resize,
 * camera capture, paste support, resumable uploads, and comprehensive cleanup.
 *
 * @example
 * ```ts
 * const upload = new FileUploadEnhanced(document.getElementById('upload')!, {
 *   maxSize: 20 * 1024 * 1024,
 *   chunked: true,
 *   parallelUploads: 3,
 *   accept: 'image/*',
 *   uploadUrl: '/api/upload',
 *   onUpload: (fileObj) => console.log('Uploaded:', fileObj.name),
 * });
 * ```
 */
class FileUploadEnhanced {
  public element: HTMLElement;
  public options: ResolvedOptions;
  public state: UploadState;
  public stats: UploadStats;

  // Memory management
  private handlers: Map<EventTarget, HandlerRecord[]>;
  private timers: Set<ReturnType<typeof setTimeout>>;
  private createdElements: Set<HTMLElement>;
  private activeUploads: Map<string, XMLHttpRequest>;
  private fileReaders: Set<FileReader>;
  private objectURLs: Set<string>;

  // DOM references (set during init() called from constructor)
  private wrapper!: HTMLDivElement;
  private zone!: HTMLDivElement;
  private input!: HTMLInputElement;
  private browseBtn!: HTMLButtonElement;
  private cameraBtn: HTMLButtonElement | null;
  private fileList!: HTMLDivElement;
  private statsBar!: HTMLDivElement;
  private statsText!: HTMLDivElement;
  private uploadAllBtn!: HTMLButtonElement;
  private clearAllBtn!: HTMLButtonElement;

  constructor(element: HTMLElement, options: FileUploadEnhancedOptions = {}) {
    this.element = element;

    // Memory management
    this.handlers = new Map();
    this.timers = new Set();
    this.createdElements = new Set();
    this.activeUploads = new Map();
    this.fileReaders = new Set();
    this.objectURLs = new Set();
    this.cameraBtn = null;

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

      // Labels (i18n)
      labels: {
        // UI labels
        dropZone: 'Drop files here or click to browse',
        fileUploadArea: 'File upload area',
        chooseFiles: 'Choose Files',
        takePhoto: 'Take Photo',
        uploadAll: 'Upload All',
        clearAll: 'Clear All',
        capture: 'Capture',
        close: 'Close',
        upload: 'Upload',
        pause: 'Pause',
        retry: 'Retry',
        remove: 'Remove',
        // Status
        statusReady: 'Ready',
        statusUploading: 'Uploading...',
        statusComplete: 'Complete',
        statusFailed: 'Failed',
        statusPaused: 'Paused',
        // Descriptions
        allTypesAccepted: 'All file types accepted',
        acceptedTypes: (types: string) => `Accepted: ${types}`,
        statsText: (count: number, size: string, pending: number) =>
          `${count} files (${size}) - ${pending} pending`,
        // Errors
        maxFilesReached: 'Maximum number of files reached',
        maxFilesRemaining: (remaining: number) => `Only ${remaining} more file(s) can be added`,
        validationFailed: (name: string) => `File "${name}" validation failed`,
        fileTooLarge: (name: string, maxSize: string) =>
          `File "${name}" exceeds maximum size of ${maxSize}`,
        typeNotAllowed: (type: string) => `File type "${type}" not allowed`,
        extensionNotAllowed: (ext: string) => `File extension ".${ext}" not allowed`,
        extensionBlocked: (ext: string) => `File extension ".${ext}" is blocked`,
        duplicateFile: (name: string) => `File "${name}" already added`,
        cameraAccessDenied: 'Camera access denied',
        uploadInProgress: 'Files are still uploading. Are you sure you want to leave?',
        ...(options.labels || {}),
      },

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

      ...options,
    } as ResolvedOptions;

    // State management
    this.state = {
      files: new Map(),
      queue: [],
      uploading: new Set(),
      completed: new Set(),
      failed: new Set(),
      paused: new Set(),
      totalProgress: 0,
      isDragging: false,
    };

    // Statistics
    this.stats = {
      totalFiles: 0,
      totalSize: 0,
      uploadedSize: 0,
      startTime: null,
      endTime: null,
      successCount: 0,
      errorCount: 0,
    };

    this.init();
  }

  private init(): void {
    this.createUploadZone();
    this.bindEvents();

    if (this.options.sortable && this.options.showFileList) {
      this.initSortable();
    }

    if (this.options.resumable) {
      this.loadSavedUploads();
    }
  }

  private createUploadZone(): void {
    // Create main wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'aiab-file-upload-enhanced';
    if (this.options.theme) {
      wrapper.classList.add(`file-upload-theme-${this.options.theme}`);
    }

    // Create drop zone
    const zone = document.createElement('div');
    zone.className = 'aiab-file-upload-zone';
    zone.setAttribute('role', 'button');
    zone.setAttribute('tabindex', '0');
    zone.setAttribute('aria-label', this.options.labels.fileUploadArea);

    // Icon
    const icon = document.createElement('div');
    icon.className = 'aiab-file-upload-icon';
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Text
    const label = document.createElement('div');
    label.className = 'aiab-file-upload-label';
    label.textContent = this.options.labels.dropZone;

    // Description
    const description = document.createElement('div');
    description.className = 'aiab-file-upload-description';
    description.textContent = this.getAcceptText();

    // Input
    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'aiab-file-upload-input';
    input.multiple = this.options.multiple;
    if (this.options.accept !== '*') {
      input.accept = this.options.accept;
    }
    if (this.options.camera) {
      input.capture = 'environment';
    }

    // Buttons container
    const buttons = document.createElement('div');
    buttons.className = 'aiab-file-upload-buttons';

    // Browse button
    const browseBtn = document.createElement('button');
    browseBtn.type = 'button';
    browseBtn.className = 'aiab-file-upload-browse';
    browseBtn.textContent = this.options.labels.chooseFiles;

    // Camera button
    if (this.options.camera && this.hasCamera()) {
      const cameraBtn = document.createElement('button');
      cameraBtn.type = 'button';
      cameraBtn.className = 'aiab-file-upload-camera';
      cameraBtn.textContent = this.options.labels.takePhoto;
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
    fileList.className = 'aiab-file-upload-list';
    if (!this.options.showFileList) {
      fileList.style.display = 'none';
    }

    // Stats bar
    const statsBar = document.createElement('div');
    statsBar.className = 'aiab-file-upload-stats';
    statsBar.style.display = 'none';

    const statsText = document.createElement('div');
    statsText.className = 'aiab-file-upload-stats-text';

    const statsActions = document.createElement('div');
    statsActions.className = 'aiab-file-upload-stats-actions';

    // Upload all button
    const uploadAllBtn = document.createElement('button');
    uploadAllBtn.type = 'button';
    uploadAllBtn.className = 'aiab-file-upload-all';
    uploadAllBtn.textContent = this.options.labels.uploadAll;
    uploadAllBtn.style.display = 'none';

    // Clear all button
    const clearAllBtn = document.createElement('button');
    clearAllBtn.type = 'button';
    clearAllBtn.className = 'aiab-file-upload-clear';
    clearAllBtn.textContent = this.options.labels.clearAll;
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

  private bindEvents(): void {
    // File input
    this.addHandler(this.input, 'change', ((e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.handleFiles(target.files);
      }
      target.value = ''; // Reset input
    }) as EventListener);

    // Browse button
    this.addHandler(this.browseBtn, 'click', (() => {
      this.input.click();
    }) as EventListener);

    // Zone click
    this.addHandler(this.zone, 'click', ((e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target === this.zone ||
        target.closest('.aiab-file-upload-icon, .aiab-file-upload-label')
      ) {
        this.input.click();
      }
    }) as EventListener);

    // Keyboard support
    this.addHandler(this.zone, 'keydown', ((e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.input.click();
      }
    }) as EventListener);

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
      this.addHandler(this.cameraBtn, 'click', (() => this.openCamera()) as EventListener);
    }

    // Upload/Clear all
    this.addHandler(this.uploadAllBtn, 'click', (() => this.uploadAll()) as EventListener);
    this.addHandler(this.clearAllBtn, 'click', (() => this.clearAll()) as EventListener);

    // Window events
    this.addHandler(window, 'beforeunload', ((e: BeforeUnloadEvent) => {
      if (this.state.uploading.size > 0) {
        e.preventDefault();
        e.returnValue = this.options.labels.uploadInProgress;
      }
    }) as EventListener);
  }

  private setupDragAndDrop(): void {
    let dragCounter = 0;

    const dragEnter: EventListener = (e: Event) => {
      e.preventDefault();
      dragCounter++;
      if (dragCounter === 1) {
        this.state.isDragging = true;
        this.zone.classList.add('aiab-file-upload-zone--drag-active');
      }
    };

    const dragLeave: EventListener = (e: Event) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        this.state.isDragging = false;
        this.zone.classList.remove('aiab-file-upload-zone--drag-active');
      }
    };

    const dragOver: EventListener = (e: Event) => {
      e.preventDefault();
      (e as DragEvent).dataTransfer!.dropEffect = 'copy';
    };

    const drop: EventListener = (e: Event) => {
      e.preventDefault();
      dragCounter = 0;
      this.state.isDragging = false;
      this.zone.classList.remove('aiab-file-upload-zone--drag-active');

      const dragEvent = e as DragEvent;
      const items = dragEvent.dataTransfer?.items;
      if (items) {
        this.handleDataTransferItems(items);
      } else if (dragEvent.dataTransfer) {
        this.handleFiles(dragEvent.dataTransfer.files);
      }
    };

    this.addHandler(this.zone, 'dragenter', dragEnter);
    this.addHandler(this.zone, 'dragleave', dragLeave);
    this.addHandler(this.zone, 'dragover', dragOver);
    this.addHandler(this.zone, 'drop', drop);

    // Prevent default drag over page
    this.addHandler(document.body, 'dragover', ((e: Event) => e.preventDefault()) as EventListener);
    this.addHandler(document.body, 'drop', ((e: Event) => {
      const target = e.target as Node;
      if (!this.zone.contains(target)) {
        e.preventDefault();
      }
    }) as EventListener);
  }

  private setupPaste(): void {
    const pasteHandler: EventListener = (e: Event) => {
      const clipboardEvent = e as ClipboardEvent;
      const items = clipboardEvent.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];

      for (const item of items) {
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

  private async handleDataTransferItems(items: DataTransferItemList): Promise<void> {
    const entries: FileSystemEntry[] = [];

    for (const item of items) {
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry) entries.push(entry);
      }
    }

    const files = await this.traverseFileTree(entries);
    this.handleFiles(files);
  }

  private async traverseFileTree(entries: FileSystemEntry[]): Promise<File[]> {
    const files: File[] = [];

    const traverse = async (entry: FileSystemEntry): Promise<void> => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        const file = await new Promise<File>((resolve) => {
          fileEntry.file(resolve);
        });
        files.push(file);
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const reader = dirEntry.createReader();
        const childEntries = await new Promise<FileSystemEntry[]>((resolve) => {
          reader.readEntries(resolve);
        });

        for (const childEntry of childEntries) {
          await traverse(childEntry);
        }
      }
    };

    for (const entry of entries) {
      await traverse(entry);
    }

    return files;
  }

  private handleFiles(fileList: FileList | File[]): void {
    const files = Array.from(fileList);

    // Check max files
    if (this.options.maxFiles) {
      const currentCount = this.state.files.size;
      const remaining = this.options.maxFiles - currentCount;

      if (remaining <= 0) {
        this.showError(this.options.labels.maxFilesReached);
        return;
      }

      if (files.length > remaining) {
        files.splice(remaining);
        this.showError(this.options.labels.maxFilesRemaining(remaining));
      }
    }

    // Process each file
    for (const file of files) {
      if (this.validateFile(file)) {
        this.addFile(file);
      }
    }

    // Auto upload
    if (this.options.autoUpload && this.state.queue.length > 0) {
      this.uploadAll();
    }
  }

  private validateFile(file: File): boolean {
    // Custom validator
    if (this.options.validateFile) {
      const result = this.options.validateFile(file);
      if (result !== true) {
        this.showError(result || this.options.labels.validationFailed(file.name));
        return false;
      }
    }

    // Size check
    if (file.size > this.options.maxSize) {
      this.showError(
        this.options.labels.fileTooLarge(file.name, this.formatSize(this.options.maxSize)),
      );
      return false;
    }

    // Type check
    if (!this.checkFileType(file)) {
      this.showError(this.options.labels.typeNotAllowed(file.type || 'unknown'));
      return false;
    }

    // Extension check
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (this.options.allowedExtensions) {
      if (!this.options.allowedExtensions.includes(ext)) {
        this.showError(this.options.labels.extensionNotAllowed(ext));
        return false;
      }
    }

    if (this.options.blockedExtensions) {
      if (this.options.blockedExtensions.includes(ext)) {
        this.showError(this.options.labels.extensionBlocked(ext));
        return false;
      }
    }

    // Duplicate check
    if (this.options.duplicateCheck) {
      for (const [_id, fileObj] of this.state.files) {
        if (
          fileObj.file.name === file.name &&
          fileObj.file.size === file.size &&
          fileObj.file.lastModified === file.lastModified
        ) {
          this.showError(this.options.labels.duplicateFile(file.name));
          return false;
        }
      }
    }

    return true;
  }

  private checkFileType(file: File): boolean {
    if (this.options.accept === '*') return true;

    const accepts = this.options.accept.split(',').map((a: string) => a.trim());

    return accepts.some((accept: string) => {
      if (accept.startsWith('.')) {
        return file.name.toLowerCase().endsWith(accept.toLowerCase());
      }
      if (accept.endsWith('/*')) {
        return file.type.startsWith(accept.slice(0, -2));
      }
      return file.type === accept;
    });
  }

  private async addFile(file: File): Promise<void> {
    const id = this.generateId();

    // Process image if needed
    let processedFile: File = file;
    if (this.options.imageResize && file.type.startsWith('image/')) {
      processedFile = await this.resizeImage(file);
    }

    const fileObj: EnhancedFileEntry = {
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
      thumbnail: null,
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

  private async resizeImage(file: File): Promise<File> {
    return new Promise<File>((resolve) => {
      const reader = new FileReader();
      this.fileReaders.add(reader);

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

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
            (blob: Blob | null) => {
              const resizedFile = new File([blob!], file.name, {
                type: `image/${this.options.imageFormat}`,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            `image/${this.options.imageFormat}`,
            this.options.imageQuality,
          );
        };

        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    });
  }

  private async generateThumbnail(file: File): Promise<string> {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      this.fileReaders.add(reader);

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
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

        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    });
  }

  private renderFileItem(fileObj: EnhancedFileEntry): void {
    const item = document.createElement('div');
    item.className = 'aiab-file-upload-item';
    item.dataset.fileId = fileObj.id;

    // Preview
    const preview = document.createElement('div');
    preview.className = 'aiab-file-upload-preview';

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
    info.className = 'aiab-file-upload-info';

    const name = document.createElement('div');
    name.className = 'aiab-file-upload-name';
    name.textContent = fileObj.name;
    name.title = fileObj.name;

    const meta = document.createElement('div');
    meta.className = 'aiab-file-upload-meta';

    const size = document.createElement('span');
    size.className = 'aiab-file-upload-size';
    size.textContent = this.formatSize(fileObj.size);

    const status = document.createElement('span');
    status.className = `aiab-file-upload-status aiab-file-upload-status--${fileObj.status}`;
    status.textContent = this.getStatusText(fileObj.status);

    const speed = document.createElement('span');
    speed.className = 'aiab-file-upload-speed';
    speed.style.display = 'none';

    meta.appendChild(size);
    meta.appendChild(status);
    meta.appendChild(speed);

    info.appendChild(name);
    info.appendChild(meta);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'aiab-file-upload-actions';

    // Upload button
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'aiab-file-upload-upload';
    uploadBtn.type = 'button';
    uploadBtn.innerHTML = '\u2B06';
    uploadBtn.title = this.options.labels.upload;

    // Pause button
    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'aiab-file-upload-pause';
    pauseBtn.type = 'button';
    pauseBtn.innerHTML = '\u23F8';
    pauseBtn.title = this.options.labels.pause;
    pauseBtn.style.display = 'none';

    // Retry button
    const retryBtn = document.createElement('button');
    retryBtn.className = 'aiab-file-upload-retry';
    retryBtn.type = 'button';
    retryBtn.innerHTML = '\u21BB';
    retryBtn.title = this.options.labels.retry;
    retryBtn.style.display = 'none';

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'aiab-file-upload-remove';
    removeBtn.type = 'button';
    removeBtn.innerHTML = '\u00D7';
    removeBtn.title = this.options.labels.remove;

    actions.appendChild(uploadBtn);
    actions.appendChild(pauseBtn);
    actions.appendChild(retryBtn);
    actions.appendChild(removeBtn);

    // Progress bar
    const progress = document.createElement('div');
    progress.className = 'aiab-file-upload-progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'aiab-file-upload-progress-bar';
    progress.appendChild(progressBar);

    // Assemble item
    item.appendChild(preview);
    item.appendChild(info);
    item.appendChild(actions);
    item.appendChild(progress);

    // Bind item events
    this.addHandler(uploadBtn, 'click', (() => this.uploadFile(fileObj.id)) as EventListener);
    this.addHandler(pauseBtn, 'click', (() => this.pauseUpload(fileObj.id)) as EventListener);
    this.addHandler(retryBtn, 'click', (() => this.retryUpload(fileObj.id)) as EventListener);
    this.addHandler(removeBtn, 'click', (() => this.removeFile(fileObj.id)) as EventListener);

    this.fileList.appendChild(item);
    this.createdElements.add(item);
  }

  private async uploadFile(fileId: string): Promise<void> {
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
      fileObj.error = (error as Error).message;
      this.state.failed.add(fileId);
      this.stats.errorCount++;

      if (this.options.onError) {
        this.options.onError(fileObj, error as Error, this);
      }

      // Auto retry
      if (fileObj.retries < this.options.retryCount) {
        fileObj.retries++;
        const delay = this.options.retryDelay * 2 ** (fileObj.retries - 1);

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

  // biome-ignore lint/suspicious/noExplicitAny: server response shape is unknown
  private uploadSimple(fileObj: EnhancedFileEntry): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      fileObj.xhr = xhr;
      this.activeUploads.set(fileObj.id, xhr);

      const formData = new FormData();
      formData.append('file', fileObj.file);

      // Progress
      xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
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
      for (const key of Object.keys(this.options.headers)) {
        xhr.setRequestHeader(key, this.options.headers[key]);
      }

      if (this.options.withCredentials) {
        xhr.withCredentials = true;
      }

      if (this.options.timeout) {
        xhr.timeout = this.options.timeout;
      }

      xhr.send(formData);
    });
  }

  private async uploadChunked(fileObj: EnhancedFileEntry): Promise<void> {
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

  // biome-ignore lint/suspicious/noExplicitAny: server response shape is unknown
  private uploadChunk(
    fileObj: EnhancedFileEntry,
    chunk: Blob,
    index: number,
    total: number,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append('chunk', chunk);
      formData.append('chunkIndex', String(index));
      formData.append('totalChunks', String(total));
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

      for (const key of Object.keys(this.options.headers)) {
        xhr.setRequestHeader(key, this.options.headers[key]);
      }

      xhr.send(formData);
    });
  }

  private pauseUpload(fileId: string): void {
    const fileObj = this.state.files.get(fileId);
    if (!fileObj) return;

    if (fileObj.xhr) {
      fileObj.xhr.abort();
    }

    this.state.paused.add(fileId);
    fileObj.status = 'paused';
    this.updateFileStatus(fileObj);
  }

  private retryUpload(fileId: string): void {
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

  private updateProgress(fileObj: EnhancedFileEntry, percent: number, loaded: number): void {
    fileObj.progress = percent;
    fileObj.uploadedSize = loaded;

    // Calculate speed
    const elapsed = Date.now() - (fileObj.startTime ?? Date.now());
    fileObj.speed = loaded / (elapsed / 1000);

    // Calculate time remaining
    const remaining = fileObj.size - loaded;
    fileObj.timeRemaining = remaining / fileObj.speed;

    // Update UI
    const item = this.fileList.querySelector(`[data-file-id="${fileObj.id}"]`);
    if (item) {
      const bar = item.querySelector('.aiab-file-upload-progress-bar') as HTMLElement | null;
      if (bar) {
        bar.style.width = `${percent}%`;
      }

      const speedEl = item.querySelector('.aiab-file-upload-speed') as HTMLElement | null;
      if (speedEl) {
        speedEl.style.display = 'inline';
        speedEl.textContent = `${this.formatSize(fileObj.speed)}/s`;
      }
    }

    // Update total progress
    this.updateTotalProgress();

    if (this.options.onProgress) {
      this.options.onProgress(fileObj, percent, this);
    }
  }

  private updateFileStatus(fileObj: EnhancedFileEntry): void {
    const item = this.fileList.querySelector(`[data-file-id="${fileObj.id}"]`);
    if (!item) return;

    const status = item.querySelector('.aiab-file-upload-status') as HTMLElement | null;
    if (status) {
      status.className = `aiab-file-upload-status aiab-file-upload-status--${fileObj.status}`;
      status.textContent = this.getStatusText(fileObj.status);
    }

    // Update action buttons
    const uploadBtn = item.querySelector('.aiab-file-upload-upload') as HTMLElement | null;
    const pauseBtn = item.querySelector('.aiab-file-upload-pause') as HTMLElement | null;
    const retryBtn = item.querySelector('.aiab-file-upload-retry') as HTMLElement | null;

    if (uploadBtn) uploadBtn.style.display = fileObj.status === 'pending' ? 'block' : 'none';
    if (pauseBtn) pauseBtn.style.display = fileObj.status === 'uploading' ? 'block' : 'none';
    if (retryBtn) retryBtn.style.display = fileObj.status === 'error' ? 'block' : 'none';

    // Hide progress on success/error
    if (fileObj.status === 'success' || fileObj.status === 'error') {
      const progress = item.querySelector('.aiab-file-upload-progress') as HTMLElement | null;
      if (progress) {
        progress.style.display = 'none';
      }
    }
  }

  private updateTotalProgress(): void {
    let totalSize = 0;
    let uploadedSize = 0;

    this.state.files.forEach((fileObj: EnhancedFileEntry) => {
      totalSize += fileObj.size;
      uploadedSize += fileObj.uploadedSize;
    });

    this.state.totalProgress = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0;
    this.stats.uploadedSize = uploadedSize;
  }

  private updateStats(): void {
    const fileCount = this.state.files.size;

    if (fileCount > 0) {
      this.statsBar.style.display = 'flex';

      const pendingCount = Array.from(this.state.files.values()).filter(
        (f: EnhancedFileEntry) => f.status === 'pending',
      ).length;

      this.statsText.textContent = this.options.labels.statsText(
        fileCount,
        this.formatSize(this.stats.totalSize),
        pendingCount,
      );

      this.uploadAllBtn.style.display = pendingCount > 0 ? 'block' : 'none';
      this.clearAllBtn.style.display = fileCount > 0 ? 'block' : 'none';
    } else {
      this.statsBar.style.display = 'none';
    }
  }

  public removeFile(fileId: string): void {
    const fileObj = this.state.files.get(fileId);
    if (!fileObj) return;

    // Cancel upload if in progress
    if (fileObj.xhr) {
      fileObj.xhr.abort();
    }

    // Clean up
    this.state.files.delete(fileId);
    this.state.queue = this.state.queue.filter((id: string) => id !== fileId);
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

  public uploadAll(): void {
    const pendingFiles = Array.from(this.state.files.values())
      .filter((f: EnhancedFileEntry) => f.status === 'pending')
      .map((f: EnhancedFileEntry) => f.id);

    // Upload in parallel with limit
    const uploadNext = (): void => {
      while (this.state.uploading.size < this.options.parallelUploads && pendingFiles.length > 0) {
        const fileId = pendingFiles.shift()!;
        this.uploadFile(fileId).then(() => {
          uploadNext();
        });
      }
    };

    uploadNext();
  }

  public clearAll(): void {
    // Cancel all uploads
    this.state.files.forEach((fileObj: EnhancedFileEntry) => {
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
      errorCount: 0,
    };

    this.updateStats();
  }

  private initSortable(): void {
    // Implementation depends on whether Sortable.js is available
    // This is a placeholder for sortable functionality
  }

  private loadSavedUploads(): void {
    // Load resumable uploads from localStorage
    try {
      const saved = localStorage.getItem('amphibious-uploads');
      if (saved) {
        const _uploads: SavedUploadEntry[] = JSON.parse(saved);
        // Restore upload state
      }
    } catch (_e: unknown) {
      // Ignore errors
    }
  }

  private saveUploads(): void {
    // Save resumable uploads to localStorage
    if (!this.options.resumable) return;

    try {
      const uploads: SavedUploadEntry[] = Array.from(this.state.files.values()).map(
        (f: EnhancedFileEntry) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          chunks: f.chunks,
          progress: f.progress,
        }),
      );

      localStorage.setItem('amphibious-uploads', JSON.stringify(uploads));
    } catch (_e: unknown) {
      // Ignore errors
    }
  }

  private hasCamera(): boolean {
    return !!navigator.mediaDevices?.getUserMedia;
  }

  private async openCamera(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Create camera modal
      const modal = document.createElement('div');
      modal.className = 'aiab-file-upload-camera-modal';

      const video = document.createElement('video');
      video.autoplay = true;
      video.srcObject = stream;

      const captureBtn = document.createElement('button');
      captureBtn.textContent = this.options.labels.capture;
      captureBtn.onclick = (): void => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')!.drawImage(video, 0, 0);

        canvas.toBlob((blob: Blob | null) => {
          const file = new File([blob!], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          this.handleFiles([file]);

          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          modal.remove();
        });
      };

      const closeBtn = document.createElement('button');
      closeBtn.textContent = this.options.labels.close;
      closeBtn.onclick = (): void => {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        modal.remove();
      };

      modal.appendChild(video);
      modal.appendChild(captureBtn);
      modal.appendChild(closeBtn);

      document.body.appendChild(modal);
      this.createdElements.add(modal);
    } catch (_error: unknown) {
      this.showError(this.options.labels.cameraAccessDenied);
    }
  }

  // Helper methods
  private getFileIcon(type: string): string {
    const icons: Record<string, string> = {
      image: '\uD83D\uDDBC\uFE0F',
      video: '\uD83C\uDFA5',
      audio: '\uD83C\uDFB5',
      'application/pdf': '\uD83D\uDCC4',
      'application/zip': '\uD83D\uDCE6',
      text: '\uD83D\uDCDD',
    };

    for (const key in icons) {
      if (type.startsWith(key)) {
        return `<span class="aiab-file-upload-icon-emoji">${icons[key]}</span>`;
      }
    }

    return '<span class="aiab-file-upload-icon-emoji">\uD83D\uDCCE</span>';
  }

  private getStatusText(status: EnhancedFileStatus): string {
    const texts: Record<EnhancedFileStatus, string> = {
      pending: this.options.labels.statusReady,
      uploading: this.options.labels.statusUploading,
      success: this.options.labels.statusComplete,
      error: this.options.labels.statusFailed,
      paused: this.options.labels.statusPaused,
    };
    return texts[status] || status;
  }

  private getAcceptText(): string {
    if (this.options.accept === '*') {
      return this.options.labels.allTypesAccepted;
    }
    return this.options.labels.acceptedTypes(this.options.accept);
  }

  private formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
  }

  private generateId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private showError(message: string): void {
    if (this.options.onError) {
      this.options.onError(null, new Error(message), this);
    }
  }

  private addHandler(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);

    if (!this.handlers.has(element)) {
      this.handlers.set(element, []);
    }

    this.handlers.get(element)!.push({ event, handler });
  }

  // Public API
  public getFiles(): EnhancedFileEntry[] {
    return Array.from(this.state.files.values());
  }

  public getFile(fileId: string): EnhancedFileEntry | undefined {
    return this.state.files.get(fileId);
  }

  public addFiles(files: FileList | File[]): void {
    this.handleFiles(files);
  }

  public upload(fileId?: string): void {
    if (fileId) {
      this.uploadFile(fileId);
    } else {
      this.uploadAll();
    }
  }

  public pause(fileId?: string): void {
    if (fileId) {
      this.pauseUpload(fileId);
    } else {
      this.state.uploading.forEach((id: string) => this.pauseUpload(id));
    }
  }

  public resume(fileId?: string): void {
    if (fileId) {
      this.state.paused.delete(fileId);
      this.uploadFile(fileId);
    } else {
      const paused = Array.from(this.state.paused);
      for (const id of paused) {
        this.state.paused.delete(id);
        this.uploadFile(id);
      }
    }
  }

  public remove(fileId?: string): void {
    if (fileId) {
      this.removeFile(fileId);
    } else {
      this.clearAll();
    }
  }

  /**
   * Comprehensive destroy method
   */
  public destroy(): void {
    // Cancel all active uploads
    this.activeUploads.forEach((xhr: XMLHttpRequest) => xhr.abort());
    this.activeUploads.clear();

    // Clear all timers
    this.timers.forEach((timer: ReturnType<typeof setTimeout>) => clearTimeout(timer));
    this.timers.clear();

    // Remove all event listeners
    this.handlers.forEach((handlerList: HandlerRecord[], element: EventTarget) => {
      for (const { event, handler } of handlerList) {
        element.removeEventListener(event, handler);
      }
    });
    this.handlers.clear();

    // Abort all file readers
    this.fileReaders.forEach((reader: FileReader) => reader.abort());
    this.fileReaders.clear();

    // Revoke object URLs
    this.objectURLs.forEach((url: string) => URL.revokeObjectURL(url));
    this.objectURLs.clear();

    // Remove created elements
    this.createdElements.forEach((element: HTMLElement) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.createdElements.clear();

    // Clear state
    this.state.files.clear();
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).state = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).stats = null;

    // Clear references
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).element = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).wrapper = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).zone = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).input = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).browseBtn = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).cameraBtn = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).fileList = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).statsBar = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).statsText = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).uploadAllBtn = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).clearAllBtn = null;
    // biome-ignore lint/suspicious/noExplicitAny: nullifying for GC after destroy
    (this as any).options = null;
  }
}

// ---------------------------------------------------------------------------
// Global registration
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    FileUploadEnhanced: typeof FileUploadEnhanced;
  }
}

// Register with component registry if available
if (window.AmphibiousRegistry) {
  // biome-ignore lint/suspicious/noExplicitAny: constructor type variance for registry
  window.AmphibiousRegistry.registerComponent('file-upload', FileUploadEnhanced as any, {
    selector: '[data-file-upload]',
    autoInit: true,
  });
}

// Export
window.FileUploadEnhanced = FileUploadEnhanced;
export default FileUploadEnhanced;
export { FileUploadEnhanced };
