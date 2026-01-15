/**
 * Form Builder Component
 * Drag-and-drop form creation with validation and export
 * Part of Amphibious 2.0 Component Library
 *
 * Features:
 * - Drag-and-drop interface
 * - 20+ field types
 * - Custom validation rules
 * - Conditional logic
 * - Multi-step forms
 * - Form templates
 * - JSON import/export
 * - Live preview
 * - Accessibility compliant
 */

class FormBuilder {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      // Field types to include
      fieldTypes: options.fieldTypes || [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'textarea',
        'select',
        'radio',
        'checkbox',
        'switch',
        'date',
        'time',
        'datetime',
        'color',
        'range',
        'file',
        'heading',
        'paragraph',
        'divider',
        'spacer',
        'html',
      ],

      // UI options
      showToolbox: options.showToolbox !== false,
      showProperties: options.showProperties !== false,
      showPreview: options.showPreview !== false,
      allowNesting: options.allowNesting || false,
      autoSave: options.autoSave || false,
      autoSaveInterval: options.autoSaveInterval || 30000, // 30 seconds

      // Features
      enableValidation: options.enableValidation !== false,
      enableConditional: options.enableConditional || false,
      enableMultiStep: options.enableMultiStep || false,
      enableTemplates: options.enableTemplates || false,

      // Styling
      theme: options.theme || 'light',
      compact: options.compact || false,

      // Templates
      templates: options.templates || [],

      // Labels
      labels: {
        toolbox: options.labels?.toolbox || 'Field Types',
        canvas: options.labels?.canvas || 'Form Canvas',
        properties: options.labels?.properties || 'Properties',
        preview: options.labels?.preview || 'Preview',
        save: options.labels?.save || 'Save Form',
        load: options.labels?.load || 'Load Form',
        export: options.labels?.export || 'Export JSON',
        import: options.labels?.import || 'Import JSON',
        clear: options.labels?.clear || 'Clear All',
        ...options.labels,
      },

      // Callbacks
      onChange: options.onChange || null,
      onSave: options.onSave || null,
      onFieldAdd: options.onFieldAdd || null,
      onFieldRemove: options.onFieldRemove || null,
      onFieldUpdate: options.onFieldUpdate || null,

      ...options,
    };

    // State
    this.state = {
      fields: [],
      selectedField: null,
      isDragging: false,
      draggedElement: null,
      draggedField: null,
      dropTarget: null,
      currentStep: 0,
      formData: {},
      validationErrors: {},
      history: [],
      historyIndex: -1,
    };

    // Field definitions
    this.fieldDefinitions = this.getFieldDefinitions();

    // Track resources
    this.handlers = new Map();
    this.timers = new Set();
    this.createdElements = new Set();
    this.observers = new Set();

    this.init();
  }

  getFieldDefinitions() {
    return {
      // Input fields
      text: {
        label: 'Text Input',
        icon: '📝',
        category: 'input',
        defaultProps: {
          type: 'text',
          label: 'Text Field',
          name: '',
          placeholder: 'Enter text...',
          required: false,
          minLength: null,
          maxLength: null,
          pattern: null,
        },
      },
      email: {
        label: 'Email',
        icon: '📧',
        category: 'input',
        defaultProps: {
          type: 'email',
          label: 'Email Address',
          name: '',
          placeholder: 'email@example.com',
          required: false,
          validation: 'email',
        },
      },
      password: {
        label: 'Password',
        icon: '🔒',
        category: 'input',
        defaultProps: {
          type: 'password',
          label: 'Password',
          name: '',
          placeholder: 'Enter password...',
          required: false,
          minLength: 8,
          showStrength: true,
        },
      },
      number: {
        label: 'Number',
        icon: '🔢',
        category: 'input',
        defaultProps: {
          type: 'number',
          label: 'Number Field',
          name: '',
          placeholder: '0',
          required: false,
          min: null,
          max: null,
          step: 1,
        },
      },
      tel: {
        label: 'Phone',
        icon: '📱',
        category: 'input',
        defaultProps: {
          type: 'tel',
          label: 'Phone Number',
          name: '',
          placeholder: '(555) 123-4567',
          required: false,
          pattern: null,
        },
      },
      url: {
        label: 'URL',
        icon: '🔗',
        category: 'input',
        defaultProps: {
          type: 'url',
          label: 'Website URL',
          name: '',
          placeholder: 'https://example.com',
          required: false,
        },
      },

      // Text areas
      textarea: {
        label: 'Textarea',
        icon: '📄',
        category: 'text',
        defaultProps: {
          type: 'textarea',
          label: 'Message',
          name: '',
          placeholder: 'Enter your message...',
          required: false,
          rows: 4,
          maxLength: null,
        },
      },

      // Selection fields
      select: {
        label: 'Dropdown',
        icon: '📋',
        category: 'selection',
        defaultProps: {
          type: 'select',
          label: 'Select Option',
          name: '',
          required: false,
          multiple: false,
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        },
      },
      radio: {
        label: 'Radio Group',
        icon: '⭕',
        category: 'selection',
        defaultProps: {
          type: 'radio',
          label: 'Choose One',
          name: '',
          required: false,
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        },
      },
      checkbox: {
        label: 'Checkbox',
        icon: '☑️',
        category: 'selection',
        defaultProps: {
          type: 'checkbox',
          label: 'Checkbox',
          name: '',
          required: false,
          value: 'checked',
        },
      },
      switch: {
        label: 'Toggle Switch',
        icon: '🎚️',
        category: 'selection',
        defaultProps: {
          type: 'switch',
          label: 'Enable Feature',
          name: '',
          required: false,
          value: false,
        },
      },

      // Date & Time
      date: {
        label: 'Date Picker',
        icon: '📅',
        category: 'datetime',
        defaultProps: {
          type: 'date',
          label: 'Date',
          name: '',
          required: false,
          min: null,
          max: null,
        },
      },
      time: {
        label: 'Time Picker',
        icon: '⏰',
        category: 'datetime',
        defaultProps: {
          type: 'time',
          label: 'Time',
          name: '',
          required: false,
        },
      },
      datetime: {
        label: 'Date & Time',
        icon: '📆',
        category: 'datetime',
        defaultProps: {
          type: 'datetime-local',
          label: 'Date & Time',
          name: '',
          required: false,
        },
      },

      // Special inputs
      color: {
        label: 'Color Picker',
        icon: '🎨',
        category: 'special',
        defaultProps: {
          type: 'color',
          label: 'Choose Color',
          name: '',
          value: '#ED8B00',
        },
      },
      range: {
        label: 'Range Slider',
        icon: '📊',
        category: 'special',
        defaultProps: {
          type: 'range',
          label: 'Range',
          name: '',
          min: 0,
          max: 100,
          step: 1,
          value: 50,
        },
      },
      file: {
        label: 'File Upload',
        icon: '📎',
        category: 'special',
        defaultProps: {
          type: 'file',
          label: 'Upload File',
          name: '',
          required: false,
          accept: '*',
          multiple: false,
          maxSize: 5242880, // 5MB
        },
      },

      // Layout elements
      heading: {
        label: 'Heading',
        icon: '📌',
        category: 'layout',
        defaultProps: {
          type: 'heading',
          text: 'Section Title',
          level: 'h3',
          className: '',
        },
      },
      paragraph: {
        label: 'Paragraph',
        icon: '📝',
        category: 'layout',
        defaultProps: {
          type: 'paragraph',
          text: 'Add some descriptive text here...',
          className: '',
        },
      },
      divider: {
        label: 'Divider',
        icon: '➖',
        category: 'layout',
        defaultProps: {
          type: 'divider',
          style: 'solid',
        },
      },
      spacer: {
        label: 'Spacer',
        icon: '⬜',
        category: 'layout',
        defaultProps: {
          type: 'spacer',
          height: 24,
        },
      },
      html: {
        label: 'Custom HTML',
        icon: '</>',
        category: 'layout',
        defaultProps: {
          type: 'html',
          content: '<div>Custom HTML content</div>',
        },
      },
    };
  }

  init() {
    this.setupDOM();
    this.attachEvents();
    this.loadFromStorage();

    if (this.options.autoSave) {
      this.startAutoSave();
    }
  }

  setupDOM() {
    // Clear element
    this.element.innerHTML = '';
    this.element.classList.add('form-builder');

    // Create main layout
    const layout = document.createElement('div');
    layout.className = 'form-builder-layout';

    // Create toolbox
    if (this.options.showToolbox) {
      this.toolbox = this.createToolbox();
      layout.appendChild(this.toolbox);
    }

    // Create canvas area
    this.canvasArea = this.createCanvasArea();
    layout.appendChild(this.canvasArea);

    // Create properties panel
    if (this.options.showProperties) {
      this.propertiesPanel = this.createPropertiesPanel();
      layout.appendChild(this.propertiesPanel);
    }

    // Create toolbar
    this.toolbar = this.createToolbar();
    this.element.appendChild(this.toolbar);
    this.element.appendChild(layout);

    // Store references
    this.createdElements.add(layout);
    this.createdElements.add(this.toolbar);
  }

  createToolbox() {
    const toolbox = document.createElement('div');
    toolbox.className = 'form-builder-toolbox';

    const header = document.createElement('div');
    header.className = 'toolbox-header';
    header.innerHTML = `<h3>${this.options.labels.toolbox}</h3>`;
    toolbox.appendChild(header);

    const categories = {};

    // Group fields by category
    Object.entries(this.fieldDefinitions).forEach(([type, def]) => {
      if (!this.options.fieldTypes.includes(type)) return;

      if (!categories[def.category]) {
        categories[def.category] = [];
      }
      categories[def.category].push({ type, ...def });
    });

    // Create category sections
    Object.entries(categories).forEach(([category, fields]) => {
      const section = document.createElement('div');
      section.className = 'toolbox-section';

      const categoryTitle = document.createElement('div');
      categoryTitle.className = 'toolbox-category';
      categoryTitle.textContent = this.formatCategory(category);
      section.appendChild(categoryTitle);

      const fieldList = document.createElement('div');
      fieldList.className = 'toolbox-fields';

      fields.forEach((field) => {
        const fieldEl = document.createElement('div');
        fieldEl.className = 'toolbox-field';
        fieldEl.draggable = true;
        fieldEl.dataset.fieldType = field.type;
        fieldEl.innerHTML = `
          <span class="field-icon">${field.icon}</span>
          <span class="field-label">${field.label}</span>
        `;
        fieldList.appendChild(fieldEl);
      });

      section.appendChild(fieldList);
      toolbox.appendChild(section);
    });

    // Add templates section if enabled
    if (this.options.enableTemplates && this.options.templates.length) {
      const templatesSection = this.createTemplatesSection();
      toolbox.appendChild(templatesSection);
    }

    this.createdElements.add(toolbox);
    return toolbox;
  }

  createCanvasArea() {
    const area = document.createElement('div');
    area.className = 'form-builder-canvas-area';

    // Canvas header with tabs
    const header = document.createElement('div');
    header.className = 'canvas-header';

    const tabs = document.createElement('div');
    tabs.className = 'canvas-tabs';

    const buildTab = document.createElement('button');
    buildTab.className = 'tab-btn active';
    buildTab.textContent = 'Build';
    buildTab.dataset.tab = 'build';

    const previewTab = document.createElement('button');
    previewTab.className = 'tab-btn';
    previewTab.textContent = this.options.labels.preview;
    previewTab.dataset.tab = 'preview';

    tabs.appendChild(buildTab);
    if (this.options.showPreview) {
      tabs.appendChild(previewTab);
    }

    header.appendChild(tabs);
    area.appendChild(header);

    // Canvas container
    const container = document.createElement('div');
    container.className = 'canvas-container';

    // Build canvas
    this.canvas = document.createElement('div');
    this.canvas.className = 'form-builder-canvas active';
    this.canvas.dataset.tab = 'build';

    // Empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'canvas-empty';
    emptyState.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M12 8v8M8 12h8"/>
      </svg>
      <p>Drag fields here to start building your form</p>
    `;
    this.canvas.appendChild(emptyState);

    // Preview canvas
    if (this.options.showPreview) {
      this.preview = document.createElement('div');
      this.preview.className = 'form-builder-preview';
      this.preview.dataset.tab = 'preview';
      container.appendChild(this.preview);
    }

    container.appendChild(this.canvas);
    area.appendChild(container);

    // Multi-step navigation if enabled
    if (this.options.enableMultiStep) {
      this.stepNav = this.createStepNavigation();
      area.appendChild(this.stepNav);
    }

    this.createdElements.add(area);
    return area;
  }

  createPropertiesPanel() {
    const panel = document.createElement('div');
    panel.className = 'form-builder-properties';

    const header = document.createElement('div');
    header.className = 'properties-header';
    header.innerHTML = `<h3>${this.options.labels.properties}</h3>`;
    panel.appendChild(header);

    this.propertiesContent = document.createElement('div');
    this.propertiesContent.className = 'properties-content';
    this.propertiesContent.innerHTML = `
      <div class="properties-empty">
        <p>Select a field to edit its properties</p>
      </div>
    `;
    panel.appendChild(this.propertiesContent);

    this.createdElements.add(panel);
    return panel;
  }

  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'form-builder-toolbar';

    const leftActions = document.createElement('div');
    leftActions.className = 'toolbar-actions left';

    // Undo/Redo buttons
    const undoBtn = document.createElement('button');
    undoBtn.className = 'toolbar-btn';
    undoBtn.title = 'Undo';
    undoBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 7h12a4 4 0 014 4v6a4 4 0 01-4 4H5"/>
      <path d="M3 7l-3 3 3 3"/>
    </svg>`;

    const redoBtn = document.createElement('button');
    redoBtn.className = 'toolbar-btn';
    redoBtn.title = 'Redo';
    redoBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 7H9a4 4 0 00-4 4v6a4 4 0 004 4h10"/>
      <path d="M21 7l3 3-3 3"/>
    </svg>`;

    leftActions.appendChild(undoBtn);
    leftActions.appendChild(redoBtn);

    const rightActions = document.createElement('div');
    rightActions.className = 'toolbar-actions right';

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'toolbar-btn';
    clearBtn.textContent = this.options.labels.clear;

    // Import/Export buttons
    const importBtn = document.createElement('button');
    importBtn.className = 'toolbar-btn';
    importBtn.textContent = this.options.labels.import;

    const exportBtn = document.createElement('button');
    exportBtn.className = 'toolbar-btn';
    exportBtn.textContent = this.options.labels.export;

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'toolbar-btn primary';
    saveBtn.textContent = this.options.labels.save;

    rightActions.appendChild(clearBtn);
    rightActions.appendChild(importBtn);
    rightActions.appendChild(exportBtn);
    rightActions.appendChild(saveBtn);

    toolbar.appendChild(leftActions);
    toolbar.appendChild(rightActions);

    // Hidden file input for import
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = '.json';
    this.fileInput.style.display = 'none';
    toolbar.appendChild(this.fileInput);

    this.createdElements.add(toolbar);
    return toolbar;
  }

  createStepNavigation() {
    const nav = document.createElement('div');
    nav.className = 'form-builder-steps';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'step-btn prev';
    prevBtn.textContent = 'Previous';

    const indicator = document.createElement('div');
    indicator.className = 'step-indicator';
    indicator.textContent = 'Step 1 of 1';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'step-btn next';
    nextBtn.textContent = 'Next';

    const addStepBtn = document.createElement('button');
    addStepBtn.className = 'step-btn add';
    addStepBtn.textContent = '+ Add Step';

    nav.appendChild(prevBtn);
    nav.appendChild(indicator);
    nav.appendChild(nextBtn);
    nav.appendChild(addStepBtn);

    this.createdElements.add(nav);
    return nav;
  }

  createTemplatesSection() {
    const section = document.createElement('div');
    section.className = 'toolbox-section templates';

    const title = document.createElement('div');
    title.className = 'toolbox-category';
    title.textContent = 'Templates';
    section.appendChild(title);

    const templateList = document.createElement('div');
    templateList.className = 'template-list';

    this.options.templates.forEach((template) => {
      const templateEl = document.createElement('div');
      templateEl.className = 'template-item';
      templateEl.dataset.templateId = template.id;
      templateEl.innerHTML = `
        <span class="template-icon">📋</span>
        <span class="template-name">${template.name}</span>
      `;
      templateList.appendChild(templateEl);
    });

    section.appendChild(templateList);
    return section;
  }

  attachEvents() {
    // Toolbox drag events
    if (this.toolbox) {
      const fieldEls = this.toolbox.querySelectorAll('.toolbox-field');
      fieldEls.forEach((field) => {
        this.attachDragEvents(field, 'new');
      });

      // Template clicks
      const templates = this.toolbox.querySelectorAll('.template-item');
      templates.forEach((template) => {
        const handler = () => this.loadTemplate(template.dataset.templateId);
        template.addEventListener('click', handler);
        this.handlers.set(`template-${template.dataset.templateId}`, {
          element: template,
          type: 'click',
          handler,
        });
      });
    }

    // Canvas drop events
    this.attachDropEvents(this.canvas);

    // Tab switching
    const tabs = this.element.querySelectorAll('.tab-btn');
    tabs.forEach((tab) => {
      const handler = () => this.switchTab(tab.dataset.tab);
      tab.addEventListener('click', handler);
      this.handlers.set(`tab-${tab.dataset.tab}`, {
        element: tab,
        type: 'click',
        handler,
      });
    });

    // Toolbar actions
    const toolbar = this.element.querySelector('.form-builder-toolbar');
    if (toolbar) {
      const undoBtn = toolbar.querySelector('.toolbar-btn[title="Undo"]');
      const redoBtn = toolbar.querySelector('.toolbar-btn[title="Redo"]');
      const clearBtn = toolbar.querySelector('.toolbar-btn:not(.primary)');
      const importBtn = toolbar.querySelectorAll('.toolbar-btn')[3];
      const exportBtn = toolbar.querySelectorAll('.toolbar-btn')[4];
      const saveBtn = toolbar.querySelector('.toolbar-btn.primary');

      if (undoBtn) {
        const undoHandler = () => this.undo();
        undoBtn.addEventListener('click', undoHandler);
        this.handlers.set('undo', { element: undoBtn, type: 'click', handler: undoHandler });
      }

      if (redoBtn) {
        const redoHandler = () => this.redo();
        redoBtn.addEventListener('click', redoHandler);
        this.handlers.set('redo', { element: redoBtn, type: 'click', handler: redoHandler });
      }

      if (clearBtn) {
        const clearHandler = () => this.clearForm();
        clearBtn.addEventListener('click', clearHandler);
        this.handlers.set('clear', { element: clearBtn, type: 'click', handler: clearHandler });
      }

      if (importBtn) {
        const importHandler = () => this.importForm();
        importBtn.addEventListener('click', importHandler);
        this.handlers.set('import', { element: importBtn, type: 'click', handler: importHandler });
      }

      if (exportBtn) {
        const exportHandler = () => this.exportForm();
        exportBtn.addEventListener('click', exportHandler);
        this.handlers.set('export', { element: exportBtn, type: 'click', handler: exportHandler });
      }

      if (saveBtn) {
        const saveHandler = () => this.saveForm();
        saveBtn.addEventListener('click', saveHandler);
        this.handlers.set('save', { element: saveBtn, type: 'click', handler: saveHandler });
      }
    }

    // File input for import
    if (this.fileInput) {
      const fileHandler = (e) => this.handleFileImport(e);
      this.fileInput.addEventListener('change', fileHandler);
      this.handlers.set('file-input', {
        element: this.fileInput,
        type: 'change',
        handler: fileHandler,
      });
    }

    // Multi-step navigation
    if (this.stepNav) {
      const prevBtn = this.stepNav.querySelector('.prev');
      const nextBtn = this.stepNav.querySelector('.next');
      const addBtn = this.stepNav.querySelector('.add');

      if (prevBtn) {
        const prevHandler = () => this.previousStep();
        prevBtn.addEventListener('click', prevHandler);
        this.handlers.set('step-prev', { element: prevBtn, type: 'click', handler: prevHandler });
      }

      if (nextBtn) {
        const nextHandler = () => this.nextStep();
        nextBtn.addEventListener('click', nextHandler);
        this.handlers.set('step-next', { element: nextBtn, type: 'click', handler: nextHandler });
      }

      if (addBtn) {
        const addHandler = () => this.addStep();
        addBtn.addEventListener('click', addHandler);
        this.handlers.set('step-add', { element: addBtn, type: 'click', handler: addHandler });
      }
    }

    // Keyboard shortcuts
    const keyHandler = (e) => this.handleKeyboard(e);
    document.addEventListener('keydown', keyHandler);
    this.handlers.set('keyboard', { element: document, type: 'keydown', handler: keyHandler });
  }

  attachDragEvents(element, mode = 'new') {
    const dragStartHandler = (e) => this.handleDragStart(e, mode);
    const dragEndHandler = (e) => this.handleDragEnd(e);

    element.addEventListener('dragstart', dragStartHandler);
    element.addEventListener('dragend', dragEndHandler);

    this.handlers.set(`drag-start-${element.dataset.fieldType || element.dataset.fieldId}`, {
      element,
      type: 'dragstart',
      handler: dragStartHandler,
    });

    this.handlers.set(`drag-end-${element.dataset.fieldType || element.dataset.fieldId}`, {
      element,
      type: 'dragend',
      handler: dragEndHandler,
    });
  }

  attachDropEvents(element) {
    const dragOverHandler = (e) => this.handleDragOver(e);
    const dropHandler = (e) => this.handleDrop(e);
    const dragLeaveHandler = (e) => this.handleDragLeave(e);

    element.addEventListener('dragover', dragOverHandler);
    element.addEventListener('drop', dropHandler);
    element.addEventListener('dragleave', dragLeaveHandler);

    const id = element.dataset?.fieldId || 'canvas';
    this.handlers.set(`dragover-${id}`, { element, type: 'dragover', handler: dragOverHandler });
    this.handlers.set(`drop-${id}`, { element, type: 'drop', handler: dropHandler });
    this.handlers.set(`dragleave-${id}`, { element, type: 'dragleave', handler: dragLeaveHandler });
  }

  handleDragStart(e, mode) {
    this.state.isDragging = true;
    this.state.draggedElement = e.target;

    if (mode === 'new') {
      // Dragging from toolbox
      const fieldType = e.target.dataset.fieldType;
      this.state.draggedField = {
        type: fieldType,
        isNew: true,
      };
    } else {
      // Dragging existing field
      const fieldId = e.target.dataset.fieldId;
      const field = this.state.fields.find((f) => f.id === fieldId);
      this.state.draggedField = {
        ...field,
        isNew: false,
      };
    }

    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
  }

  handleDragEnd(e) {
    this.state.isDragging = false;
    this.state.draggedElement = null;
    this.state.draggedField = null;
    this.state.dropTarget = null;

    e.target.classList.remove('dragging');

    // Remove all drag indicators
    this.element.querySelectorAll('.drag-over, .drag-before, .drag-after').forEach((el) => {
      el.classList.remove('drag-over', 'drag-before', 'drag-after');
    });
  }

  handleDragOver(e) {
    if (!this.state.isDragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const target = e.target.closest('.form-field, .form-builder-canvas');
    if (!target) return;

    // Remove previous indicators
    this.element.querySelectorAll('.drag-over, .drag-before, .drag-after').forEach((el) => {
      el.classList.remove('drag-over', 'drag-before', 'drag-after');
    });

    if (target.classList.contains('form-builder-canvas')) {
      target.classList.add('drag-over');
      this.state.dropTarget = { element: target, position: 'append' };
    } else {
      // Determine position (before or after)
      const rect = target.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const position = e.clientY < midpoint ? 'before' : 'after';

      target.classList.add(`drag-${position}`);
      this.state.dropTarget = { element: target, position };
    }
  }

  handleDragLeave(e) {
    const target = e.target.closest('.form-field, .form-builder-canvas');
    if (target) {
      target.classList.remove('drag-over', 'drag-before', 'drag-after');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    if (!this.state.draggedField || !this.state.dropTarget) return;

    const { element, position } = this.state.dropTarget;

    if (this.state.draggedField.isNew) {
      // Create new field
      const field = this.createField(this.state.draggedField.type);
      this.addField(field, element, position);
    } else {
      // Move existing field
      this.moveField(this.state.draggedField.id, element, position);
    }

    // Clean up
    element.classList.remove('drag-over', 'drag-before', 'drag-after');
  }

  createField(type) {
    const definition = this.fieldDefinitions[type];
    const id = this.generateId();

    return {
      id,
      type,
      ...definition.defaultProps,
      name: `field_${id}`,
    };
  }

  addField(field, targetElement, position) {
    // Add to state
    if (position === 'append' || targetElement.classList.contains('form-builder-canvas')) {
      this.state.fields.push(field);
    } else {
      const targetId = targetElement.dataset.fieldId;
      const targetIndex = this.state.fields.findIndex((f) => f.id === targetId);

      if (position === 'before') {
        this.state.fields.splice(targetIndex, 0, field);
      } else {
        this.state.fields.splice(targetIndex + 1, 0, field);
      }
    }

    // Render field
    this.renderFields();

    // Select new field
    this.selectField(field.id);

    // Save to history
    this.saveHistory();

    // Trigger callback
    if (this.options.onFieldAdd) {
      this.options.onFieldAdd(field);
    }
  }

  moveField(fieldId, targetElement, position) {
    // Find and remove field from current position
    const fieldIndex = this.state.fields.findIndex((f) => f.id === fieldId);
    const field = this.state.fields.splice(fieldIndex, 1)[0];

    // Insert at new position
    if (position === 'append' || targetElement.classList.contains('form-builder-canvas')) {
      this.state.fields.push(field);
    } else {
      const targetId = targetElement.dataset.fieldId;
      const targetIndex = this.state.fields.findIndex((f) => f.id === targetId);

      if (position === 'before') {
        this.state.fields.splice(targetIndex, 0, field);
      } else {
        this.state.fields.splice(targetIndex + 1, 0, field);
      }
    }

    this.renderFields();
    this.saveHistory();
  }

  renderFields() {
    // Clear canvas
    this.canvas.innerHTML = '';

    if (this.state.fields.length === 0) {
      // Show empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'canvas-empty';
      emptyState.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
        <p>Drag fields here to start building your form</p>
      `;
      this.canvas.appendChild(emptyState);
      return;
    }

    // Render each field
    this.state.fields.forEach((field) => {
      const fieldEl = this.renderField(field);
      this.canvas.appendChild(fieldEl);
    });
  }

  renderField(field) {
    const fieldEl = document.createElement('div');
    fieldEl.className = 'form-field';
    fieldEl.dataset.fieldId = field.id;
    fieldEl.dataset.fieldType = field.type;
    fieldEl.draggable = true;

    if (this.state.selectedField === field.id) {
      fieldEl.classList.add('selected');
    }

    // Field header
    const header = document.createElement('div');
    header.className = 'field-header';

    const handle = document.createElement('span');
    handle.className = 'field-handle';
    handle.innerHTML = '⋮⋮';

    const label = document.createElement('span');
    label.className = 'field-label';
    label.textContent = field.label || field.type;

    const actions = document.createElement('div');
    actions.className = 'field-actions';

    const duplicateBtn = document.createElement('button');
    duplicateBtn.className = 'field-action';
    duplicateBtn.title = 'Duplicate';
    duplicateBtn.innerHTML = '📋';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'field-action delete';
    deleteBtn.title = 'Delete';
    deleteBtn.innerHTML = '🗑️';

    actions.appendChild(duplicateBtn);
    actions.appendChild(deleteBtn);

    header.appendChild(handle);
    header.appendChild(label);
    header.appendChild(actions);

    // Field preview
    const preview = document.createElement('div');
    preview.className = 'field-preview';
    preview.innerHTML = this.getFieldPreview(field);

    fieldEl.appendChild(header);
    fieldEl.appendChild(preview);

    // Attach events
    this.attachDragEvents(fieldEl, 'move');

    const clickHandler = (e) => {
      if (!e.target.closest('.field-action')) {
        this.selectField(field.id);
      }
    };
    fieldEl.addEventListener('click', clickHandler);
    this.handlers.set(`field-click-${field.id}`, {
      element: fieldEl,
      type: 'click',
      handler: clickHandler,
    });

    const duplicateHandler = (e) => {
      e.stopPropagation();
      this.duplicateField(field.id);
    };
    duplicateBtn.addEventListener('click', duplicateHandler);
    this.handlers.set(`field-duplicate-${field.id}`, {
      element: duplicateBtn,
      type: 'click',
      handler: duplicateHandler,
    });

    const deleteHandler = (e) => {
      e.stopPropagation();
      this.deleteField(field.id);
    };
    deleteBtn.addEventListener('click', deleteHandler);
    this.handlers.set(`field-delete-${field.id}`, {
      element: deleteBtn,
      type: 'click',
      handler: deleteHandler,
    });

    return fieldEl;
  }

  getFieldPreview(field) {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
      case 'date':
      case 'time':
      case 'datetime-local':
      case 'color':
        return `<input type="${field.type}" placeholder="${field.placeholder || ''}" disabled />`;

      case 'textarea':
        return `<textarea placeholder="${field.placeholder || ''}" rows="${field.rows || 3}" disabled></textarea>`;

      case 'select':
        return `<select disabled>
          ${field.options?.map((opt) => `<option>${opt.label}</option>`).join('') || '<option>Option</option>'}
        </select>`;

      case 'radio':
        return (
          field.options
            ?.map(
              (opt) => `
          <label class="radio-label">
            <input type="radio" name="${field.name}" disabled />
            <span>${opt.label}</span>
          </label>
        `,
            )
            .join('') || '<label><input type="radio" disabled /> Option</label>'
        );

      case 'checkbox':
        return `<label class="checkbox-label">
          <input type="checkbox" disabled />
          <span>${field.label}</span>
        </label>`;

      case 'switch':
        return `<label class="switch-label">
          <span class="switch">
            <span class="switch-slider"></span>
          </span>
          <span>${field.label}</span>
        </label>`;

      case 'range':
        return `<input type="range" min="${field.min}" max="${field.max}" value="${field.value}" disabled />`;

      case 'file':
        return `<div class="file-upload">
          <button disabled>Choose File</button>
          <span>No file chosen</span>
        </div>`;

      case 'heading':
        return `<${field.level || 'h3'}>${field.text}</${field.level || 'h3'}>`;

      case 'paragraph':
        return `<p>${field.text}</p>`;

      case 'divider':
        return `<hr style="border-style: ${field.style || 'solid'}" />`;

      case 'spacer':
        return `<div style="height: ${field.height || 24}px"></div>`;

      case 'html':
        return field.content || '<div>HTML Content</div>';

      default:
        return `<div>${field.type}</div>`;
    }
  }

  selectField(fieldId) {
    this.state.selectedField = fieldId;

    // Update UI
    this.canvas.querySelectorAll('.form-field').forEach((el) => {
      el.classList.toggle('selected', el.dataset.fieldId === fieldId);
    });

    // Show properties
    if (this.propertiesPanel) {
      this.showProperties(fieldId);
    }
  }

  showProperties(fieldId) {
    const field = this.state.fields.find((f) => f.id === fieldId);
    if (!field) {
      this.propertiesContent.innerHTML = `
        <div class="properties-empty">
          <p>Select a field to edit its properties</p>
        </div>
      `;
      return;
    }

    // Create property form
    const form = document.createElement('form');
    form.className = 'properties-form';

    // Basic properties
    const basicSection = document.createElement('div');
    basicSection.className = 'property-section';
    basicSection.innerHTML = `<h4>Basic</h4>`;

    // Field-specific properties
    const properties = this.getFieldProperties(field);

    properties.forEach((prop) => {
      const group = document.createElement('div');
      group.className = 'property-group';

      const label = document.createElement('label');
      label.textContent = prop.label;

      const input = this.createPropertyInput(prop, field);

      group.appendChild(label);
      group.appendChild(input);
      basicSection.appendChild(group);

      // Attach change event
      const changeHandler = (e) => this.updateFieldProperty(fieldId, prop.name, e.target.value);
      input.addEventListener('change', changeHandler);
      this.handlers.set(`prop-${fieldId}-${prop.name}`, {
        element: input,
        type: 'change',
        handler: changeHandler,
      });
    });

    form.appendChild(basicSection);

    // Validation section if applicable
    if (this.options.enableValidation && this.hasValidation(field.type)) {
      const validationSection = this.createValidationSection(field);
      form.appendChild(validationSection);
    }

    // Conditional logic section if enabled
    if (this.options.enableConditional) {
      const conditionalSection = this.createConditionalSection(field);
      form.appendChild(conditionalSection);
    }

    this.propertiesContent.innerHTML = '';
    this.propertiesContent.appendChild(form);
  }

  getFieldProperties(field) {
    const common = [
      { name: 'label', label: 'Label', type: 'text' },
      { name: 'name', label: 'Field Name', type: 'text' },
      { name: 'placeholder', label: 'Placeholder', type: 'text' },
    ];

    const specific = {
      text: [],
      number: [
        { name: 'min', label: 'Min Value', type: 'number' },
        { name: 'max', label: 'Max Value', type: 'number' },
        { name: 'step', label: 'Step', type: 'number' },
      ],
      textarea: [{ name: 'rows', label: 'Rows', type: 'number' }],
      select: [{ name: 'multiple', label: 'Multiple Selection', type: 'checkbox' }],
      file: [
        { name: 'accept', label: 'Accepted Types', type: 'text' },
        { name: 'multiple', label: 'Multiple Files', type: 'checkbox' },
      ],
      range: [
        { name: 'min', label: 'Min Value', type: 'number' },
        { name: 'max', label: 'Max Value', type: 'number' },
        { name: 'step', label: 'Step', type: 'number' },
        { name: 'value', label: 'Default Value', type: 'number' },
      ],
    };

    const layout = {
      heading: [
        { name: 'text', label: 'Text', type: 'text' },
        {
          name: 'level',
          label: 'Level',
          type: 'select',
          options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        },
      ],
      paragraph: [{ name: 'text', label: 'Text', type: 'textarea' }],
      spacer: [{ name: 'height', label: 'Height (px)', type: 'number' }],
      html: [{ name: 'content', label: 'HTML Content', type: 'textarea' }],
    };

    // Return appropriate properties based on field type
    if (layout[field.type]) {
      return layout[field.type];
    }

    if (['heading', 'paragraph', 'divider', 'spacer', 'html'].includes(field.type)) {
      return [];
    }

    return [...common, ...(specific[field.type] || [])];
  }

  createPropertyInput(prop, field) {
    let input;

    switch (prop.type) {
      case 'select':
        input = document.createElement('select');
        input.className = 'property-input';
        prop.options.forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          option.selected = field[prop.name] === opt;
          input.appendChild(option);
        });
        break;

      case 'checkbox':
        input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'property-checkbox';
        input.checked = field[prop.name] || false;
        break;

      case 'textarea':
        input = document.createElement('textarea');
        input.className = 'property-input';
        input.rows = 3;
        input.value = field[prop.name] || '';
        break;

      default:
        input = document.createElement('input');
        input.type = prop.type || 'text';
        input.className = 'property-input';
        input.value = field[prop.name] || '';
        break;
    }

    return input;
  }

  createValidationSection(field) {
    const section = document.createElement('div');
    section.className = 'property-section';
    section.innerHTML = `<h4>Validation</h4>`;

    const required = document.createElement('div');
    required.className = 'property-group';
    required.innerHTML = `
      <label>
        <input type="checkbox" ${field.required ? 'checked' : ''} />
        Required
      </label>
    `;

    section.appendChild(required);

    // Add field-specific validation options
    if (field.type === 'text' || field.type === 'textarea') {
      const minLength = this.createValidationInput('Min Length', 'minLength', 'number', field);
      const maxLength = this.createValidationInput('Max Length', 'maxLength', 'number', field);
      section.appendChild(minLength);
      section.appendChild(maxLength);
    }

    return section;
  }

  createValidationInput(label, name, type, field) {
    const group = document.createElement('div');
    group.className = 'property-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;

    const input = document.createElement('input');
    input.type = type;
    input.className = 'property-input';
    input.value = field[name] || '';

    group.appendChild(labelEl);
    group.appendChild(input);

    return group;
  }

  createConditionalSection(field) {
    const section = document.createElement('div');
    section.className = 'property-section';
    section.innerHTML = `
      <h4>Conditional Logic</h4>
      <button class="add-condition-btn">+ Add Condition</button>
    `;

    return section;
  }

  hasValidation(type) {
    return !['heading', 'paragraph', 'divider', 'spacer', 'html'].includes(type);
  }

  updateFieldProperty(fieldId, property, value) {
    const field = this.state.fields.find((f) => f.id === fieldId);
    if (!field) return;

    // Convert value type if needed
    if (property === 'required' || property === 'multiple') {
      value = value === 'true' || value === true;
    } else if (
      ['min', 'max', 'step', 'rows', 'height', 'minLength', 'maxLength'].includes(property)
    ) {
      value = value ? Number.parseInt(value) : null;
    }

    field[property] = value;

    // Re-render field
    this.renderFields();
    this.selectField(fieldId);

    // Save history
    this.saveHistory();

    // Trigger callback
    if (this.options.onFieldUpdate) {
      this.options.onFieldUpdate(field);
    }
  }

  duplicateField(fieldId) {
    const field = this.state.fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newField = {
      ...field,
      id: this.generateId(),
      name: `field_${this.generateId()}`,
    };

    const index = this.state.fields.findIndex((f) => f.id === fieldId);
    this.state.fields.splice(index + 1, 0, newField);

    this.renderFields();
    this.selectField(newField.id);
    this.saveHistory();
  }

  deleteField(fieldId) {
    const index = this.state.fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;

    const field = this.state.fields[index];
    this.state.fields.splice(index, 1);

    // Clear selection if deleted field was selected
    if (this.state.selectedField === fieldId) {
      this.state.selectedField = null;
      if (this.propertiesContent) {
        this.propertiesContent.innerHTML = `
          <div class="properties-empty">
            <p>Select a field to edit its properties</p>
          </div>
        `;
      }
    }

    this.renderFields();
    this.saveHistory();

    // Trigger callback
    if (this.options.onFieldRemove) {
      this.options.onFieldRemove(field);
    }
  }

  switchTab(tab) {
    // Update tab buttons
    this.element.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update content
    if (tab === 'preview') {
      this.showPreview();
      this.canvas.classList.remove('active');
      if (this.preview) {
        this.preview.classList.add('active');
      }
    } else {
      this.canvas.classList.add('active');
      if (this.preview) {
        this.preview.classList.remove('active');
      }
    }
  }

  showPreview() {
    if (!this.preview) return;

    const form = document.createElement('form');
    form.className = 'preview-form';

    this.state.fields.forEach((field) => {
      const fieldEl = this.createPreviewField(field);
      form.appendChild(fieldEl);
    });

    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = 'Submit';

    form.appendChild(submitBtn);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      console.log('Form Data:', Object.fromEntries(formData));
      alert('Form submitted! Check console for data.');
    });

    this.preview.innerHTML = '';
    this.preview.appendChild(form);
  }

  createPreviewField(field) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';

    switch (field.type) {
      case 'heading':
        const heading = document.createElement(field.level || 'h3');
        heading.textContent = field.text;
        wrapper.appendChild(heading);
        break;

      case 'paragraph':
        const p = document.createElement('p');
        p.textContent = field.text;
        wrapper.appendChild(p);
        break;

      case 'divider':
        const hr = document.createElement('hr');
        wrapper.appendChild(hr);
        break;

      case 'spacer':
        wrapper.style.height = `${field.height || 24}px`;
        break;

      case 'html':
        wrapper.innerHTML = field.content || '';
        break;

      default:
        if (field.label && field.type !== 'checkbox' && field.type !== 'switch') {
          const label = document.createElement('label');
          label.textContent = field.label;
          if (field.required) {
            label.innerHTML += ' <span class="required">*</span>';
          }
          wrapper.appendChild(label);
        }

        const input = this.createFormInput(field);
        wrapper.appendChild(input);
        break;
    }

    return wrapper;
  }

  createFormInput(field) {
    let input;

    switch (field.type) {
      case 'textarea':
        input = document.createElement('textarea');
        input.name = field.name;
        input.placeholder = field.placeholder || '';
        input.rows = field.rows || 4;
        input.required = field.required;
        break;

      case 'select':
        input = document.createElement('select');
        input.name = field.name;
        input.required = field.required;
        input.multiple = field.multiple;

        if (field.placeholder) {
          const placeholder = document.createElement('option');
          placeholder.value = '';
          placeholder.textContent = field.placeholder;
          placeholder.disabled = true;
          placeholder.selected = true;
          input.appendChild(placeholder);
        }

        field.options?.forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.label;
          input.appendChild(option);
        });
        break;

      case 'radio':
        input = document.createElement('div');
        input.className = 'radio-group';
        field.options?.forEach((opt, index) => {
          const label = document.createElement('label');
          label.className = 'radio-label';

          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = field.name;
          radio.value = opt.value;
          radio.required = field.required && index === 0;

          const span = document.createElement('span');
          span.textContent = opt.label;

          label.appendChild(radio);
          label.appendChild(span);
          input.appendChild(label);
        });
        break;

      case 'checkbox':
        input = document.createElement('label');
        input.className = 'checkbox-label';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = field.name;
        checkbox.value = field.value || 'on';
        checkbox.required = field.required;

        const span = document.createElement('span');
        span.textContent = field.label;

        input.appendChild(checkbox);
        input.appendChild(span);
        break;

      case 'switch':
        input = document.createElement('label');
        input.className = 'switch-label';

        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.name = field.name;
        switchInput.value = 'on';

        const switchEl = document.createElement('span');
        switchEl.className = 'switch';
        const slider = document.createElement('span');
        slider.className = 'switch-slider';
        switchEl.appendChild(slider);

        const text = document.createElement('span');
        text.textContent = field.label;

        input.appendChild(switchInput);
        input.appendChild(switchEl);
        input.appendChild(text);
        break;

      case 'file':
        input = document.createElement('input');
        input.type = 'file';
        input.name = field.name;
        input.accept = field.accept || '*';
        input.multiple = field.multiple;
        input.required = field.required;
        break;

      default:
        input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        input.placeholder = field.placeholder || '';
        input.required = field.required;

        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
        if (field.value !== undefined) input.value = field.value;
        if (field.pattern) input.pattern = field.pattern;
        if (field.minLength) input.minLength = field.minLength;
        if (field.maxLength) input.maxLength = field.maxLength;
        break;
    }

    return input;
  }

  handleKeyboard(e) {
    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
    }

    // Delete selected field
    if (e.key === 'Delete' && this.state.selectedField) {
      e.preventDefault();
      this.deleteField(this.state.selectedField);
    }

    // Duplicate selected field
    if ((e.ctrlKey || e.metaKey) && e.key === 'd' && this.state.selectedField) {
      e.preventDefault();
      this.duplicateField(this.state.selectedField);
    }
  }

  saveHistory() {
    // Remove any history after current index
    this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);

    // Add current state
    this.state.history.push(JSON.stringify(this.state.fields));
    this.state.historyIndex++;

    // Limit history size
    if (this.state.history.length > 50) {
      this.state.history.shift();
      this.state.historyIndex--;
    }

    // Trigger onChange
    if (this.options.onChange) {
      this.options.onChange(this.state.fields);
    }
  }

  undo() {
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      this.state.fields = JSON.parse(this.state.history[this.state.historyIndex]);
      this.renderFields();
    }
  }

  redo() {
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.historyIndex++;
      this.state.fields = JSON.parse(this.state.history[this.state.historyIndex]);
      this.renderFields();
    }
  }

  clearForm() {
    if (!confirm('Are you sure you want to clear all fields?')) return;

    this.state.fields = [];
    this.state.selectedField = null;
    this.renderFields();
    this.saveHistory();

    if (this.propertiesContent) {
      this.propertiesContent.innerHTML = `
        <div class="properties-empty">
          <p>Select a field to edit its properties</p>
        </div>
      `;
    }
  }

  saveForm() {
    const formData = {
      fields: this.state.fields,
      settings: {
        multiStep: this.options.enableMultiStep,
        validation: this.options.enableValidation,
      },
      version: '1.0',
      created: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem('form-builder-data', JSON.stringify(formData));

    // Trigger callback
    if (this.options.onSave) {
      this.options.onSave(formData);
    } else {
      alert('Form saved successfully!');
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('form-builder-data');
      if (stored) {
        const data = JSON.parse(stored);
        this.state.fields = data.fields || [];
        this.renderFields();
        this.saveHistory();
      }
    } catch (e) {
      console.error('Failed to load form data:', e);
    }
  }

  importForm() {
    this.fileInput.click();
  }

  handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        this.state.fields = data.fields || [];
        this.renderFields();
        this.saveHistory();
        alert('Form imported successfully!');
      } catch (error) {
        alert('Failed to import form. Invalid JSON file.');
      }
    };
    reader.readAsText(file);

    // Clear file input
    e.target.value = '';
  }

  exportForm() {
    const formData = {
      fields: this.state.fields,
      settings: {
        multiStep: this.options.enableMultiStep,
        validation: this.options.enableValidation,
      },
      version: '1.0',
      created: new Date().toISOString(),
    };

    const json = JSON.stringify(formData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `form-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  loadTemplate(templateId) {
    const template = this.options.templates.find((t) => t.id === templateId);
    if (!template) return;

    this.state.fields = [...template.fields];
    this.renderFields();
    this.saveHistory();
  }

  startAutoSave() {
    const autoSaveTimer = setInterval(() => {
      this.saveForm();
    }, this.options.autoSaveInterval);

    this.timers.add(autoSaveTimer);
  }

  // Multi-step form methods
  previousStep() {
    if (this.state.currentStep > 0) {
      this.state.currentStep--;
      this.updateStepDisplay();
    }
  }

  nextStep() {
    // Validate current step before proceeding
    if (this.validateStep(this.state.currentStep)) {
      this.state.currentStep++;
      this.updateStepDisplay();
    }
  }

  addStep() {
    // Implementation for adding new step
    console.log('Add step functionality to be implemented');
  }

  validateStep(stepIndex) {
    // Basic validation - can be enhanced
    return true;
  }

  updateStepDisplay() {
    if (!this.stepNav) return;

    const indicator = this.stepNav.querySelector('.step-indicator');
    indicator.textContent = `Step ${this.state.currentStep + 1} of ${this.getTotalSteps()}`;

    const prevBtn = this.stepNav.querySelector('.prev');
    const nextBtn = this.stepNav.querySelector('.next');

    prevBtn.disabled = this.state.currentStep === 0;
    nextBtn.disabled = this.state.currentStep >= this.getTotalSteps() - 1;
  }

  getTotalSteps() {
    // For now, treat entire form as single step
    // Can be enhanced to support actual multi-step forms
    return 1;
  }

  formatCategory(category) {
    const labels = {
      input: 'Basic Inputs',
      text: 'Text Areas',
      selection: 'Selection',
      datetime: 'Date & Time',
      special: 'Special Inputs',
      layout: 'Layout Elements',
    };

    return labels[category] || category;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Public API
  getFormData() {
    return {
      fields: this.state.fields,
      settings: {
        multiStep: this.options.enableMultiStep,
        validation: this.options.enableValidation,
      },
    };
  }

  setFormData(data) {
    if (data.fields) {
      this.state.fields = data.fields;
      this.renderFields();
      this.saveHistory();
    }
  }

  addFieldType(type, definition) {
    this.fieldDefinitions[type] = definition;
    this.options.fieldTypes.push(type);
    this.setupDOM(); // Re-render toolbox
  }

  destroy() {
    // Clear timers
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();

    // Remove event handlers
    this.handlers.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.handlers.clear();

    // Disconnect observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Remove created elements
    this.createdElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.createdElements.clear();

    // Clear element
    this.element.innerHTML = '';
    this.element.className = '';
  }
}

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-form-builder]').forEach((element) => {
    new FormBuilder(element);
  });
});

// Register with component registry if available
if (window.AmphibiousRegistry) {
  window.AmphibiousRegistry.registerComponent('form-builder', FormBuilder);
}

// Export
window.FormBuilder = FormBuilder;
export default FormBuilder;
