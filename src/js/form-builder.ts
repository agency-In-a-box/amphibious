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
 *
 * @module form-builder
 */

import { escapeHTML } from '../utils/sanitize';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/** Field type identifiers for all supported form field types. */
export type FieldTypeName =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'time'
  | 'datetime'
  | 'color'
  | 'range'
  | 'file'
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'spacer'
  | 'html';

/** Category groupings for the toolbox sidebar. */
export type FieldCategory = 'input' | 'text' | 'selection' | 'datetime' | 'special' | 'layout';

/** Heading level values. */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** Divider border styles. */
export type DividerStyle = 'solid' | 'dashed' | 'dotted' | 'double';

/** Drop position relative to a target element. */
export type DropPosition = 'before' | 'after' | 'append';

/** An option entry for select, radio, or checkbox group fields. */
export interface FieldOption {
  value: string;
  label: string;
}

/**
 * Base properties shared by all form fields.
 * Concrete field types extend this with type-specific properties.
 */
export interface BaseFieldProps {
  type: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/** Properties for text-like input fields (text, email, tel, url). */
export interface TextFieldProps extends BaseFieldProps {
  type: 'text' | 'email' | 'tel' | 'url';
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string | null;
  validation?: string;
}

/** Properties for password input fields. */
export interface PasswordFieldProps extends BaseFieldProps {
  type: 'password';
  minLength?: number;
  showStrength?: boolean;
}

/** Properties for number input fields. */
export interface NumberFieldProps extends BaseFieldProps {
  type: 'number';
  min?: number | null;
  max?: number | null;
  step?: number;
}

/** Properties for textarea fields. */
export interface TextareaFieldProps extends BaseFieldProps {
  type: 'textarea';
  rows?: number;
  maxLength?: number | null;
}

/** Properties for select dropdown fields. */
export interface SelectFieldProps extends BaseFieldProps {
  type: 'select';
  multiple?: boolean;
  options?: FieldOption[];
}

/** Properties for radio group fields. */
export interface RadioFieldProps extends BaseFieldProps {
  type: 'radio';
  options?: FieldOption[];
}

/** Properties for checkbox fields. */
export interface CheckboxFieldProps extends BaseFieldProps {
  type: 'checkbox';
  value?: string;
}

/** Properties for switch/toggle fields. */
export interface SwitchFieldProps extends BaseFieldProps {
  type: 'switch';
  value?: boolean;
}

/** Properties for date/time fields. */
export interface DateFieldProps extends BaseFieldProps {
  type: 'date' | 'time' | 'datetime-local';
  min?: string | null;
  max?: string | null;
}

/** Properties for color picker fields. */
export interface ColorFieldProps extends BaseFieldProps {
  type: 'color';
  value?: string;
}

/** Properties for range slider fields. */
export interface RangeFieldProps extends BaseFieldProps {
  type: 'range';
  min?: number;
  max?: number;
  step?: number;
  value?: number;
}

/** Properties for file upload fields. */
export interface FileFieldProps extends BaseFieldProps {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

/** Properties for heading layout elements. */
export interface HeadingFieldProps {
  type: 'heading';
  text: string;
  level: HeadingLevel;
  className?: string;
}

/** Properties for paragraph layout elements. */
export interface ParagraphFieldProps {
  type: 'paragraph';
  text: string;
  className?: string;
}

/** Properties for divider layout elements. */
export interface DividerFieldProps {
  type: 'divider';
  style: DividerStyle;
}

/** Properties for spacer layout elements. */
export interface SpacerFieldProps {
  type: 'spacer';
  height: number;
}

/** Properties for custom HTML layout elements. */
export interface HtmlFieldProps {
  type: 'html';
  content: string;
}

/** Union of all field property types. */
export type FieldProps =
  | TextFieldProps
  | PasswordFieldProps
  | NumberFieldProps
  | TextareaFieldProps
  | SelectFieldProps
  | RadioFieldProps
  | CheckboxFieldProps
  | SwitchFieldProps
  | DateFieldProps
  | ColorFieldProps
  | RangeFieldProps
  | FileFieldProps
  | HeadingFieldProps
  | ParagraphFieldProps
  | DividerFieldProps
  | SpacerFieldProps
  | HtmlFieldProps;

/**
 * A field instance stored in builder state.
 * Combines the unique ID with the field's configuration properties.
 */
export interface FormField {
  id: string;
  type: string;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  text?: string;
  level?: string;
  style?: string;
  height?: number;
  content?: string;
  value?: string | number | boolean;
  options?: FieldOption[];
  multiple?: boolean;
  rows?: number;
  min?: number | string | null;
  max?: number | string | null;
  step?: number;
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string | null;
  accept?: string;
  maxSize?: number;
  validation?: string;
  showStrength?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: field extensions may add arbitrary properties
  [key: string]: any;
}

/** Definition of a field type for the toolbox. */
export interface FieldDefinition {
  label: string;
  icon: string;
  category: FieldCategory;
  defaultProps: FieldProps;
}

/** A field definition combined with its type key (used when grouping by category). */
export interface FieldDefinitionWithType extends FieldDefinition {
  type: string;
}

/** Map of field type name to its definition. */
export type FieldDefinitions = Record<string, FieldDefinition>;

/** A form template that can be loaded from the toolbox. */
export interface FormTemplate {
  id: string;
  name: string;
  fields: FormField[];
}

/** Localizable UI labels used by the form builder. */
export interface FormBuilderLabels {
  toolbox: string;
  canvas: string;
  properties: string;
  preview: string;
  save: string;
  load: string;
  export: string;
  import: string;
  clear: string;
  [key: string]: string;
}

/**
 * Configuration options accepted by the {@link FormBuilder} constructor.
 * All properties are optional; unset values use sensible defaults.
 */
export interface FormBuilderOptions {
  fieldTypes?: string[];
  showToolbox?: boolean;
  showProperties?: boolean;
  showPreview?: boolean;
  allowNesting?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  enableValidation?: boolean;
  enableConditional?: boolean;
  enableMultiStep?: boolean;
  enableTemplates?: boolean;
  theme?: string;
  compact?: boolean;
  templates?: FormTemplate[];
  labels?: Partial<FormBuilderLabels>;
  onChange?: ((fields: FormField[]) => void) | null;
  onSave?: ((data: FormExportData) => void) | null;
  onFieldAdd?: ((field: FormField) => void) | null;
  onFieldRemove?: ((field: FormField) => void) | null;
  onFieldUpdate?: ((field: FormField) => void) | null;
  onSubmit?: ((data: Record<string, FormDataEntryValue>) => void) | null;
}

/**
 * Resolved configuration where defaults have been applied.
 * Labels are fully resolved with no optional properties.
 */
interface ResolvedOptions {
  fieldTypes: string[];
  showToolbox: boolean;
  showProperties: boolean;
  showPreview: boolean;
  allowNesting: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  enableValidation: boolean;
  enableConditional: boolean;
  enableMultiStep: boolean;
  enableTemplates: boolean;
  theme: string;
  compact: boolean;
  templates: FormTemplate[];
  labels: FormBuilderLabels;
  onChange: ((fields: FormField[]) => void) | null;
  onSave: ((data: FormExportData) => void) | null;
  onFieldAdd: ((field: FormField) => void) | null;
  onFieldRemove: ((field: FormField) => void) | null;
  onFieldUpdate: ((field: FormField) => void) | null;
  onSubmit?: ((data: Record<string, FormDataEntryValue>) => void) | null;
}

/** Internal state for the form builder. */
interface FormBuilderState {
  fields: FormField[];
  selectedField: string | null;
  isDragging: boolean;
  draggedElement: HTMLElement | null;
  draggedField: DraggedFieldInfo | null;
  dropTarget: DropTargetInfo | null;
  currentStep: number;
  formData: Record<string, unknown>;
  validationErrors: Record<string, string>;
  history: string[];
  historyIndex: number;
}

/** Info about a field currently being dragged. */
interface DraggedFieldInfo {
  type?: string;
  isNew: boolean;
  id?: string;
  [key: string]: unknown;
}

/** Info about the current drop target. */
interface DropTargetInfo {
  element: HTMLElement;
  position: DropPosition;
}

/** Internal bookkeeping for a tracked event listener. */
interface TrackedHandler {
  element: HTMLElement | Document;
  type: string;
  handler: EventListener;
}

/** Property descriptor for the properties panel editor. */
interface PropertyDescriptor {
  name: string;
  label: string;
  type: string;
  options?: string[];
}

/** Exported form data structure (save/export). */
export interface FormExportData {
  fields: FormField[];
  settings: {
    multiStep: boolean;
    validation: boolean;
  };
  version?: string;
  created?: string;
}

/** Form data returned by the public getFormData API. */
export interface FormDataResult {
  fields: FormField[];
  settings: {
    multiStep: boolean;
    validation: boolean;
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

class FormBuilder {
  /** Root container element. */
  element: HTMLElement;

  /** Fully resolved configuration. */
  options: ResolvedOptions;

  /** Internal state. */
  state: FormBuilderState;

  /** Registry of all field type definitions. */
  fieldDefinitions: FieldDefinitions;

  // DOM references — set during init() called from constructor
  toolbox!: HTMLDivElement;
  canvasArea!: HTMLDivElement;
  canvas!: HTMLDivElement;
  preview!: HTMLDivElement;
  propertiesPanel!: HTMLDivElement;
  propertiesContent!: HTMLDivElement;
  toolbar!: HTMLDivElement;
  fileInput!: HTMLInputElement;
  stepNav!: HTMLDivElement;

  /** Tracked event handlers for cleanup. */
  private handlers: Map<string, TrackedHandler>;

  /** Active timer IDs for cleanup. */
  private timers: Set<ReturnType<typeof setInterval>>;

  /** DOM elements created by this instance for cleanup. */
  private createdElements: Set<HTMLElement>;

  /** Observers for cleanup. */
  private observers: Set<MutationObserver>;

  constructor(element: HTMLElement, options: FormBuilderOptions = {}) {
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
      onSubmit: options.onSubmit || null,
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

  /** Sanitize user-provided HTML using DOMPurify via sanitize utility */
  private _sanitizeHTML(html: string): string {
    if (typeof html !== 'string') return '';
    if (typeof window.__amphibiousSanitizeHTML === 'function') {
      return window.__amphibiousSanitizeHTML(html);
    }
    // Fallback: strip all HTML tags if DOMPurify is not available
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  getFieldDefinitions(): FieldDefinitions {
    return {
      // Input fields
      text: {
        label: 'Text Input',
        icon: '\u{1f4dd}',
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
        } as TextFieldProps,
      },
      email: {
        label: 'Email',
        icon: '\u{1f4e7}',
        category: 'input',
        defaultProps: {
          type: 'email',
          label: 'Email Address',
          name: '',
          placeholder: 'email@example.com',
          required: false,
          validation: 'email',
        } as TextFieldProps,
      },
      password: {
        label: 'Password',
        icon: '\u{1f512}',
        category: 'input',
        defaultProps: {
          type: 'password',
          label: 'Password',
          name: '',
          placeholder: 'Enter password...',
          required: false,
          minLength: 8,
          showStrength: true,
        } as PasswordFieldProps,
      },
      number: {
        label: 'Number',
        icon: '\u{1f522}',
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
        } as NumberFieldProps,
      },
      tel: {
        label: 'Phone',
        icon: '\u{1f4f1}',
        category: 'input',
        defaultProps: {
          type: 'tel',
          label: 'Phone Number',
          name: '',
          placeholder: '(555) 123-4567',
          required: false,
          pattern: null,
        } as TextFieldProps,
      },
      url: {
        label: 'URL',
        icon: '\u{1f517}',
        category: 'input',
        defaultProps: {
          type: 'url',
          label: 'Website URL',
          name: '',
          placeholder: 'https://example.com',
          required: false,
        } as TextFieldProps,
      },

      // Text areas
      textarea: {
        label: 'Textarea',
        icon: '\u{1f4c4}',
        category: 'text',
        defaultProps: {
          type: 'textarea',
          label: 'Message',
          name: '',
          placeholder: 'Enter your message...',
          required: false,
          rows: 4,
          maxLength: null,
        } as TextareaFieldProps,
      },

      // Selection fields
      select: {
        label: 'Dropdown',
        icon: '\u{1f4cb}',
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
        } as SelectFieldProps,
      },
      radio: {
        label: 'Radio Group',
        icon: '\u{2b55}',
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
        } as RadioFieldProps,
      },
      checkbox: {
        label: 'Checkbox',
        icon: '\u{2611}\u{fe0f}',
        category: 'selection',
        defaultProps: {
          type: 'checkbox',
          label: 'Checkbox',
          name: '',
          required: false,
          value: 'checked',
        } as CheckboxFieldProps,
      },
      switch: {
        label: 'Toggle Switch',
        icon: '\u{1f39a}\u{fe0f}',
        category: 'selection',
        defaultProps: {
          type: 'switch',
          label: 'Enable Feature',
          name: '',
          required: false,
          value: false,
        } as SwitchFieldProps,
      },

      // Date & Time
      date: {
        label: 'Date Picker',
        icon: '\u{1f4c5}',
        category: 'datetime',
        defaultProps: {
          type: 'date',
          label: 'Date',
          name: '',
          required: false,
          min: null,
          max: null,
        } as DateFieldProps,
      },
      time: {
        label: 'Time Picker',
        icon: '\u{23f0}',
        category: 'datetime',
        defaultProps: {
          type: 'time',
          label: 'Time',
          name: '',
          required: false,
        } as DateFieldProps,
      },
      datetime: {
        label: 'Date & Time',
        icon: '\u{1f4c6}',
        category: 'datetime',
        defaultProps: {
          type: 'datetime-local',
          label: 'Date & Time',
          name: '',
          required: false,
        } as DateFieldProps,
      },

      // Special inputs
      color: {
        label: 'Color Picker',
        icon: '\u{1f3a8}',
        category: 'special',
        defaultProps: {
          type: 'color',
          label: 'Choose Color',
          name: '',
          value: '#ed8b00',
        } as ColorFieldProps,
      },
      range: {
        label: 'Range Slider',
        icon: '\u{1f4ca}',
        category: 'special',
        defaultProps: {
          type: 'range',
          label: 'Range',
          name: '',
          min: 0,
          max: 100,
          step: 1,
          value: 50,
        } as RangeFieldProps,
      },
      file: {
        label: 'File Upload',
        icon: '\u{1f4ce}',
        category: 'special',
        defaultProps: {
          type: 'file',
          label: 'Upload File',
          name: '',
          required: false,
          accept: '*',
          multiple: false,
          maxSize: 5242880, // 5MB
        } as FileFieldProps,
      },

      // Layout elements
      heading: {
        label: 'Heading',
        icon: '\u{1f4cc}',
        category: 'layout',
        defaultProps: {
          type: 'heading',
          text: 'Section Title',
          level: 'h3',
          className: '',
        } as HeadingFieldProps,
      },
      paragraph: {
        label: 'Paragraph',
        icon: '\u{1f4dd}',
        category: 'layout',
        defaultProps: {
          type: 'paragraph',
          text: 'Add some descriptive text here...',
          className: '',
        } as ParagraphFieldProps,
      },
      divider: {
        label: 'Divider',
        icon: '\u{2796}',
        category: 'layout',
        defaultProps: {
          type: 'divider',
          style: 'solid',
        } as DividerFieldProps,
      },
      spacer: {
        label: 'Spacer',
        icon: '\u{2b1c}',
        category: 'layout',
        defaultProps: {
          type: 'spacer',
          height: 24,
        } as SpacerFieldProps,
      },
      html: {
        label: 'Custom HTML',
        icon: '</>',
        category: 'layout',
        defaultProps: {
          type: 'html',
          content: '<div>Custom HTML content</div>',
        } as HtmlFieldProps,
      },
    };
  }

  private init(): void {
    this.setupDOM();
    this.attachEvents();
    this.loadFromStorage();

    if (this.options.autoSave) {
      this.startAutoSave();
    }
  }

  private setupDOM(): void {
    // Clear element
    this.element.innerHTML = '';
    this.element.classList.add('aiab-form-builder');

    // Create main layout
    const layout = document.createElement('div');
    layout.className = 'aiab-form-builder-layout';

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

  private createToolbox(): HTMLDivElement {
    const toolbox = document.createElement('div');
    toolbox.className = 'aiab-form-builder-toolbox';

    const header = document.createElement('div');
    header.className = 'aiab-toolbox-header';
    header.innerHTML = `<h3>${this.options.labels.toolbox}</h3>`;
    toolbox.appendChild(header);

    const categories: Record<string, FieldDefinitionWithType[]> = {};

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
      section.className = 'aiab-toolbox-section';

      const categoryTitle = document.createElement('div');
      categoryTitle.className = 'aiab-toolbox-category';
      categoryTitle.textContent = this.formatCategory(category);
      section.appendChild(categoryTitle);

      const fieldList = document.createElement('div');
      fieldList.className = 'aiab-toolbox-fields';

      fields.forEach((field) => {
        const fieldEl = document.createElement('div');
        fieldEl.className = 'aiab-toolbox-field';
        fieldEl.draggable = true;
        fieldEl.dataset.fieldType = field.type;
        fieldEl.innerHTML = `
          <span class="aiab-field-icon">${field.icon}</span>
          <span class="aiab-field-label">${field.label}</span>
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

  private createCanvasArea(): HTMLDivElement {
    const area = document.createElement('div');
    area.className = 'aiab-form-builder-canvas-area';

    // Canvas header with tabs
    const header = document.createElement('div');
    header.className = 'aiab-canvas-header';

    const tabs = document.createElement('div');
    tabs.className = 'aiab-canvas-tabs';

    const buildTab = document.createElement('button');
    buildTab.className = 'aiab-tab-btn active';
    buildTab.textContent = 'Build';
    buildTab.dataset.tab = 'build';

    const previewTab = document.createElement('button');
    previewTab.className = 'aiab-tab-btn';
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
    container.className = 'aiab-canvas-container';

    // Build canvas
    this.canvas = document.createElement('div');
    this.canvas.className = 'aiab-form-builder-canvas active';
    this.canvas.dataset.tab = 'build';

    // Empty state
    const emptyState = document.createElement('div');
    emptyState.className = 'aiab-canvas-empty';
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
      this.preview.className = 'aiab-form-builder-preview';
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

  private createPropertiesPanel(): HTMLDivElement {
    const panel = document.createElement('div');
    panel.className = 'aiab-form-builder-properties';

    const header = document.createElement('div');
    header.className = 'aiab-properties-header';
    header.innerHTML = `<h3>${this.options.labels.properties}</h3>`;
    panel.appendChild(header);

    this.propertiesContent = document.createElement('div');
    this.propertiesContent.className = 'aiab-properties-content';
    this.propertiesContent.innerHTML = `
      <div class="properties-empty">
        <p>Select a field to edit its properties</p>
      </div>
    `;
    panel.appendChild(this.propertiesContent);

    this.createdElements.add(panel);
    return panel;
  }

  private createToolbar(): HTMLDivElement {
    const toolbar = document.createElement('div');
    toolbar.className = 'aiab-form-builder-toolbar';

    const leftActions = document.createElement('div');
    leftActions.className = 'aiab-toolbar-actions left';

    // Undo/Redo buttons
    const undoBtn = document.createElement('button');
    undoBtn.className = 'aiab-toolbar-btn';
    undoBtn.title = 'Undo';
    undoBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 7h12a4 4 0 014 4v6a4 4 0 01-4 4H5"/>
      <path d="M3 7l-3 3 3 3"/>
    </svg>`;

    const redoBtn = document.createElement('button');
    redoBtn.className = 'aiab-toolbar-btn';
    redoBtn.title = 'Redo';
    redoBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 7H9a4 4 0 00-4 4v6a4 4 0 004 4h10"/>
      <path d="M21 7l3 3-3 3"/>
    </svg>`;

    leftActions.appendChild(undoBtn);
    leftActions.appendChild(redoBtn);

    const rightActions = document.createElement('div');
    rightActions.className = 'aiab-toolbar-actions right';

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'aiab-toolbar-btn';
    clearBtn.textContent = this.options.labels.clear;

    // Import/Export buttons
    const importBtn = document.createElement('button');
    importBtn.className = 'aiab-toolbar-btn';
    importBtn.textContent = this.options.labels.import;

    const exportBtn = document.createElement('button');
    exportBtn.className = 'aiab-toolbar-btn';
    exportBtn.textContent = this.options.labels.export;

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'aiab-toolbar-btn primary';
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

  private createStepNavigation(): HTMLDivElement {
    const nav = document.createElement('div');
    nav.className = 'aiab-form-builder-steps';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'step-btn prev';
    prevBtn.textContent = 'Previous';

    const indicator = document.createElement('div');
    indicator.className = 'aiab-step-indicator';
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

  private createTemplatesSection(): HTMLDivElement {
    const section = document.createElement('div');
    section.className = 'aiab-toolbox-section templates';

    const title = document.createElement('div');
    title.className = 'aiab-toolbox-category';
    title.textContent = 'Templates';
    section.appendChild(title);

    const templateList = document.createElement('div');
    templateList.className = 'aiab-template-list';

    this.options.templates.forEach((template) => {
      const templateEl = document.createElement('div');
      templateEl.className = 'aiab-template-item';
      templateEl.dataset.templateId = template.id;
      templateEl.innerHTML = `
        <span class="template-icon">\u{1f4cb}</span>
        <span class="template-name">${escapeHTML(template.name)}</span>
      `;
      templateList.appendChild(templateEl);
    });

    section.appendChild(templateList);
    return section;
  }

  private attachEvents(): void {
    // Toolbox drag events
    if (this.toolbox) {
      const fieldEls = this.toolbox.querySelectorAll('.aiab-toolbox-field');
      fieldEls.forEach((field) => {
        this.attachDragEvents(field as HTMLElement, 'new');
      });

      // Template clicks
      const templates = this.toolbox.querySelectorAll('.aiab-template-item');
      templates.forEach((template) => {
        const el = template as HTMLElement;
        const handler: EventListener = () => this.loadTemplate(el.dataset.templateId || '');
        el.addEventListener('click', handler);
        this.handlers.set(`template-${el.dataset.templateId}`, {
          element: el,
          type: 'click',
          handler,
        });
      });
    }

    // Canvas drop events
    this.attachDropEvents(this.canvas);

    // Tab switching
    const tabs = this.element.querySelectorAll('.aiab-tab-btn');
    tabs.forEach((tab) => {
      const el = tab as HTMLElement;
      const handler: EventListener = () => this.switchTab(el.dataset.tab || '');
      el.addEventListener('click', handler);
      this.handlers.set(`tab-${el.dataset.tab}`, {
        element: el,
        type: 'click',
        handler,
      });
    });

    // Toolbar actions
    const toolbar = this.element.querySelector('.aiab-form-builder-toolbar') as HTMLElement | null;
    if (toolbar) {
      const undoBtn = toolbar.querySelector(
        '.aiab-toolbar-btn[title="Undo"]',
      ) as HTMLElement | null;
      const redoBtn = toolbar.querySelector(
        '.aiab-toolbar-btn[title="Redo"]',
      ) as HTMLElement | null;
      const clearBtn = toolbar.querySelector(
        '.aiab-toolbar-btn:not(.aiab-primary)',
      ) as HTMLElement | null;
      const importBtn = toolbar.querySelectorAll('.aiab-toolbar-btn')[3] as HTMLElement | undefined;
      const exportBtn = toolbar.querySelectorAll('.aiab-toolbar-btn')[4] as HTMLElement | undefined;
      const saveBtn = toolbar.querySelector('.aiab-toolbar-btn.aiab-primary') as HTMLElement | null;

      if (undoBtn) {
        const undoHandler: EventListener = () => this.undo();
        undoBtn.addEventListener('click', undoHandler);
        this.handlers.set('undo', { element: undoBtn, type: 'click', handler: undoHandler });
      }

      if (redoBtn) {
        const redoHandler: EventListener = () => this.redo();
        redoBtn.addEventListener('click', redoHandler);
        this.handlers.set('redo', { element: redoBtn, type: 'click', handler: redoHandler });
      }

      if (clearBtn) {
        const clearHandler: EventListener = () => this.clearForm();
        clearBtn.addEventListener('click', clearHandler);
        this.handlers.set('clear', { element: clearBtn, type: 'click', handler: clearHandler });
      }

      if (importBtn) {
        const importHandler: EventListener = () => this.importForm();
        importBtn.addEventListener('click', importHandler);
        this.handlers.set('import', { element: importBtn, type: 'click', handler: importHandler });
      }

      if (exportBtn) {
        const exportHandler: EventListener = () => this.exportForm();
        exportBtn.addEventListener('click', exportHandler);
        this.handlers.set('export', { element: exportBtn, type: 'click', handler: exportHandler });
      }

      if (saveBtn) {
        const saveHandler: EventListener = () => this.saveForm();
        saveBtn.addEventListener('click', saveHandler);
        this.handlers.set('save', { element: saveBtn, type: 'click', handler: saveHandler });
      }
    }

    // File input for import
    if (this.fileInput) {
      const fileHandler: EventListener = (e) => this.handleFileImport(e as Event);
      this.fileInput.addEventListener('change', fileHandler);
      this.handlers.set('file-input', {
        element: this.fileInput,
        type: 'change',
        handler: fileHandler,
      });
    }

    // Multi-step navigation
    if (this.stepNav) {
      const prevBtn = this.stepNav.querySelector('.prev') as HTMLElement | null;
      const nextBtn = this.stepNav.querySelector('.next') as HTMLElement | null;
      const addBtn = this.stepNav.querySelector('.add') as HTMLElement | null;

      if (prevBtn) {
        const prevHandler: EventListener = () => this.previousStep();
        prevBtn.addEventListener('click', prevHandler);
        this.handlers.set('step-prev', { element: prevBtn, type: 'click', handler: prevHandler });
      }

      if (nextBtn) {
        const nextHandler: EventListener = () => this.nextStep();
        nextBtn.addEventListener('click', nextHandler);
        this.handlers.set('step-next', { element: nextBtn, type: 'click', handler: nextHandler });
      }

      if (addBtn) {
        const addHandler: EventListener = () => this.addStep();
        addBtn.addEventListener('click', addHandler);
        this.handlers.set('step-add', { element: addBtn, type: 'click', handler: addHandler });
      }
    }

    // Keyboard shortcuts
    const keyHandler: EventListener = (e) => this.handleKeyboard(e as KeyboardEvent);
    document.addEventListener('keydown', keyHandler);
    this.handlers.set('keyboard', { element: document, type: 'keydown', handler: keyHandler });
  }

  private attachDragEvents(element: HTMLElement, mode: 'new' | 'move' = 'new'): void {
    const dragStartHandler: EventListener = (e) => this.handleDragStart(e as DragEvent, mode);
    const dragEndHandler: EventListener = (e) => this.handleDragEnd(e as DragEvent);

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

  private attachDropEvents(element: HTMLElement): void {
    const dragOverHandler: EventListener = (e) => this.handleDragOver(e as DragEvent);
    const dropHandler: EventListener = (e) => this.handleDrop(e as DragEvent);
    const dragLeaveHandler: EventListener = (e) => this.handleDragLeave(e as DragEvent);

    element.addEventListener('dragover', dragOverHandler);
    element.addEventListener('drop', dropHandler);
    element.addEventListener('dragleave', dragLeaveHandler);

    const id = element.dataset?.fieldId || 'canvas';
    this.handlers.set(`dragover-${id}`, { element, type: 'dragover', handler: dragOverHandler });
    this.handlers.set(`drop-${id}`, { element, type: 'drop', handler: dropHandler });
    this.handlers.set(`dragleave-${id}`, { element, type: 'dragleave', handler: dragLeaveHandler });
  }

  private handleDragStart(e: DragEvent, mode: 'new' | 'move'): void {
    const target = e.target as HTMLElement;
    this.state.isDragging = true;
    this.state.draggedElement = target;

    if (mode === 'new') {
      // Dragging from toolbox
      const fieldType = target.dataset.fieldType;
      this.state.draggedField = {
        type: fieldType,
        isNew: true,
      };
    } else {
      // Dragging existing field
      const fieldId = target.dataset.fieldId;
      const field = this.state.fields.find((f) => f.id === fieldId);
      this.state.draggedField = {
        ...field,
        isNew: false,
      };
    }

    target.classList.add('dragging');
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    }
  }

  private handleDragEnd(e: DragEvent): void {
    const target = e.target as HTMLElement;
    this.state.isDragging = false;
    this.state.draggedElement = null;
    this.state.draggedField = null;
    this.state.dropTarget = null;

    target.classList.remove('dragging');

    // Remove all drag indicators
    this.element.querySelectorAll('.drag-over, .drag-before, .drag-after').forEach((el) => {
      el.classList.remove('drag-over', 'drag-before', 'drag-after');
    });
  }

  private handleDragOver(e: DragEvent): void {
    if (!this.state.isDragging) return;
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }

    const target = (e.target as HTMLElement).closest(
      '.aiab-form-field, .aiab-form-builder-canvas',
    ) as HTMLElement | null;
    if (!target) return;

    // Remove previous indicators
    this.element.querySelectorAll('.drag-over, .drag-before, .drag-after').forEach((el) => {
      el.classList.remove('drag-over', 'drag-before', 'drag-after');
    });

    if (target.classList.contains('aiab-form-builder-canvas')) {
      target.classList.add('drag-over');
      this.state.dropTarget = { element: target, position: 'append' };
    } else {
      // Determine position (before or after)
      const rect = target.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const position: DropPosition = e.clientY < midpoint ? 'before' : 'after';

      target.classList.add(`drag-${position}`);
      this.state.dropTarget = { element: target, position };
    }
  }

  private handleDragLeave(e: DragEvent): void {
    const target = (e.target as HTMLElement).closest(
      '.aiab-form-field, .aiab-form-builder-canvas',
    ) as HTMLElement | null;
    if (target) {
      target.classList.remove('drag-over', 'drag-before', 'drag-after');
    }
  }

  private handleDrop(e: DragEvent): void {
    e.preventDefault();
    if (!this.state.draggedField || !this.state.dropTarget) return;

    const { element, position } = this.state.dropTarget;

    if (this.state.draggedField.isNew) {
      // Create new field
      const field = this.createField(this.state.draggedField.type || '');
      this.addField(field, element, position);
    } else {
      // Move existing field
      this.moveField(this.state.draggedField.id || '', element, position);
    }

    // Clean up
    element.classList.remove('drag-over', 'drag-before', 'drag-after');
  }

  createField(type: string): FormField {
    const definition = this.fieldDefinitions[type];
    const id = this.generateId();

    return {
      id,
      ...definition.defaultProps,
      type,
      name: `field_${id}`,
    } as FormField;
  }

  addField(field: FormField, targetElement: HTMLElement, position: DropPosition): void {
    // Add to state
    if (position === 'append' || targetElement.classList.contains('aiab-form-builder-canvas')) {
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

  moveField(fieldId: string, targetElement: HTMLElement, position: DropPosition): void {
    // Find and remove field from current position
    const fieldIndex = this.state.fields.findIndex((f) => f.id === fieldId);
    const field = this.state.fields.splice(fieldIndex, 1)[0];

    // Insert at new position
    if (position === 'append' || targetElement.classList.contains('aiab-form-builder-canvas')) {
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

  private renderFields(): void {
    // Clear canvas
    this.canvas.innerHTML = '';

    if (this.state.fields.length === 0) {
      // Show empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'aiab-canvas-empty';
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

  private renderField(field: FormField): HTMLDivElement {
    const fieldEl = document.createElement('div');
    fieldEl.className = 'aiab-form-field';
    fieldEl.dataset.fieldId = field.id;
    fieldEl.dataset.fieldType = field.type;
    fieldEl.draggable = true;

    if (this.state.selectedField === field.id) {
      fieldEl.classList.add('selected');
    }

    // Field header
    const header = document.createElement('div');
    header.className = 'aiab-field-header';

    const handle = document.createElement('span');
    handle.className = 'aiab-field-handle';
    handle.innerHTML = '\u22ee\u22ee';

    const label = document.createElement('span');
    label.className = 'aiab-field-label';
    label.textContent = field.label || field.type;

    const actions = document.createElement('div');
    actions.className = 'aiab-field-actions';

    const duplicateBtn = document.createElement('button');
    duplicateBtn.className = 'aiab-field-action';
    duplicateBtn.title = 'Duplicate';
    duplicateBtn.innerHTML = '\u{1f4cb}';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'aiab-field-action delete';
    deleteBtn.title = 'Delete';
    deleteBtn.innerHTML = '\u{1f5d1}\u{fe0f}';

    actions.appendChild(duplicateBtn);
    actions.appendChild(deleteBtn);

    header.appendChild(handle);
    header.appendChild(label);
    header.appendChild(actions);

    // Field preview
    const preview = document.createElement('div');
    preview.className = 'aiab-field-preview';
    preview.innerHTML = this.getFieldPreview(field);

    fieldEl.appendChild(header);
    fieldEl.appendChild(preview);

    // Attach events
    this.attachDragEvents(fieldEl, 'move');

    const clickHandler: EventListener = (e) => {
      if (!(e.target as HTMLElement).closest('.aiab-field-action')) {
        this.selectField(field.id);
      }
    };
    fieldEl.addEventListener('click', clickHandler);
    this.handlers.set(`field-click-${field.id}`, {
      element: fieldEl,
      type: 'click',
      handler: clickHandler,
    });

    const duplicateHandler: EventListener = (e) => {
      e.stopPropagation();
      this.duplicateField(field.id);
    };
    duplicateBtn.addEventListener('click', duplicateHandler);
    this.handlers.set(`field-duplicate-${field.id}`, {
      element: duplicateBtn,
      type: 'click',
      handler: duplicateHandler,
    });

    const deleteHandler: EventListener = (e) => {
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

  private getFieldPreview(field: FormField): string {
    const e = (str: string): string => escapeHTML(str);
    const allowedTypes: string[] = [
      'text',
      'email',
      'password',
      'number',
      'tel',
      'url',
      'date',
      'time',
      'datetime-local',
      'color',
    ];
    const allowedLevels: string[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const allowedStyles: string[] = ['solid', 'dashed', 'dotted', 'double'];

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
      case 'color': {
        const safeType = allowedTypes.includes(field.type) ? field.type : 'text';
        return `<input type="${safeType}" placeholder="${e(field.placeholder || '')}" disabled />`;
      }

      case 'textarea':
        return `<textarea placeholder="${e(field.placeholder || '')}" rows="${Number.parseInt(String(field.rows), 10) || 3}" disabled></textarea>`;

      case 'select':
        return `<select disabled>
          ${field.options?.map((opt) => `<option>${e(opt.label)}</option>`).join('') || '<option>Option</option>'}
        </select>`;

      case 'radio':
        return (
          field.options
            ?.map(
              (opt) => `
          <label class="radio-label">
            <input type="radio" name="${e(field.name || '')}" disabled />
            <span>${e(opt.label)}</span>
          </label>
        `,
            )
            .join('') || '<label><input type="radio" disabled /> Option</label>'
        );

      case 'checkbox':
        return `<label class="checkbox-label">
          <input type="checkbox" disabled />
          <span>${e(field.label || '')}</span>
        </label>`;

      case 'switch':
        return `<label class="aiab-switch-label">
          <span class="aiab-switch">
            <span class="aiab-switch-slider"></span>
          </span>
          <span>${e(field.label || '')}</span>
        </label>`;

      case 'range': {
        const min = Number.parseFloat(String(field.min)) || 0;
        const max = Number.parseFloat(String(field.max)) || 100;
        const val = Number.parseFloat(String(field.value)) || 50;
        return `<input type="range" min="${min}" max="${max}" value="${val}" disabled />`;
      }

      case 'file':
        return `<div class="file-upload">
          <button disabled>Choose File</button>
          <span>No file chosen</span>
        </div>`;

      case 'heading': {
        const level = allowedLevels.includes(field.level || '') ? field.level : 'h3';
        return `<${level}>${e(field.text || '')}</${level}>`;
      }

      case 'paragraph':
        return `<p>${e(field.text || '')}</p>`;

      case 'divider': {
        const style = allowedStyles.includes(field.style || '') ? field.style : 'solid';
        return `<hr style="border-style: ${style}" />`;
      }

      case 'spacer':
        return `<div style="height: ${Number.parseInt(String(field.height), 10) || 24}px"></div>`;

      case 'html':
        return this._sanitizeHTML(field.content || '') || '<div>HTML Content</div>';

      default:
        return `<div>${e(field.type)}</div>`;
    }
  }

  selectField(fieldId: string): void {
    this.state.selectedField = fieldId;

    // Update UI
    this.canvas.querySelectorAll('.aiab-form-field').forEach((el) => {
      el.classList.toggle('selected', (el as HTMLElement).dataset.fieldId === fieldId);
    });

    // Show properties
    if (this.propertiesPanel) {
      this.showProperties(fieldId);
    }
  }

  private showProperties(fieldId: string): void {
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
    form.className = 'aiab-properties-form';

    // Basic properties
    const basicSection = document.createElement('div');
    basicSection.className = 'aiab-property-section';
    basicSection.innerHTML = '<h4>Basic</h4>';

    // Field-specific properties
    const properties = this.getFieldProperties(field);

    properties.forEach((prop) => {
      const group = document.createElement('div');
      group.className = 'aiab-property-group';

      const label = document.createElement('label');
      label.textContent = prop.label;

      const input = this.createPropertyInput(prop, field);

      group.appendChild(label);
      group.appendChild(input);
      basicSection.appendChild(group);

      // Attach change event
      const changeHandler: EventListener = (e) =>
        this.updateFieldProperty(fieldId, prop.name, (e.target as HTMLInputElement).value);
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

  private getFieldProperties(field: FormField): PropertyDescriptor[] {
    const common: PropertyDescriptor[] = [
      { name: 'label', label: 'Label', type: 'text' },
      { name: 'name', label: 'Field Name', type: 'text' },
      { name: 'placeholder', label: 'Placeholder', type: 'text' },
    ];

    const specific: Record<string, PropertyDescriptor[]> = {
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

    const layout: Record<string, PropertyDescriptor[]> = {
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

  private createPropertyInput(
    prop: PropertyDescriptor,
    field: FormField,
  ): HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement {
    let input: HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement;

    switch (prop.type) {
      case 'select':
        input = document.createElement('select');
        input.className = 'aiab-property-input';
        (prop.options || []).forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          option.selected = field[prop.name] === opt;
          (input as HTMLSelectElement).appendChild(option);
        });
        break;

      case 'checkbox':
        input = document.createElement('input');
        (input as HTMLInputElement).type = 'checkbox';
        input.className = 'aiab-property-checkbox';
        (input as HTMLInputElement).checked = field[prop.name] || false;
        break;

      case 'textarea':
        input = document.createElement('textarea');
        input.className = 'aiab-property-input';
        (input as HTMLTextAreaElement).rows = 3;
        input.value = field[prop.name] || '';
        break;

      default:
        input = document.createElement('input');
        (input as HTMLInputElement).type = prop.type || 'text';
        input.className = 'aiab-property-input';
        input.value = field[prop.name] || '';
        break;
    }

    return input;
  }

  private createValidationSection(field: FormField): HTMLDivElement {
    const section = document.createElement('div');
    section.className = 'aiab-property-section';
    section.innerHTML = '<h4>Validation</h4>';

    const required = document.createElement('div');
    required.className = 'aiab-property-group';
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

  private createValidationInput(
    label: string,
    name: string,
    type: string,
    field: FormField,
  ): HTMLDivElement {
    const group = document.createElement('div');
    group.className = 'aiab-property-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;

    const input = document.createElement('input');
    input.type = type;
    input.className = 'aiab-property-input';
    input.value = field[name] || '';

    group.appendChild(labelEl);
    group.appendChild(input);

    return group;
  }

  private createConditionalSection(_field: FormField): HTMLDivElement {
    const section = document.createElement('div');
    section.className = 'aiab-property-section';
    section.innerHTML = `
      <h4>Conditional Logic</h4>
      <button class="add-condition-btn">+ Add Condition</button>
    `;

    return section;
  }

  private hasValidation(type: string): boolean {
    return !['heading', 'paragraph', 'divider', 'spacer', 'html'].includes(type);
  }

  updateFieldProperty(fieldId: string, property: string, value: string | boolean): void {
    const field = this.state.fields.find((f) => f.id === fieldId);
    if (!field) return;

    // Convert value type if needed
    let resolved: string | boolean | number | null = value;
    if (property === 'required' || property === 'multiple') {
      resolved = value === 'true' || value === true;
    } else if (
      ['min', 'max', 'step', 'rows', 'height', 'minLength', 'maxLength'].includes(property)
    ) {
      resolved = value ? Number.parseInt(String(value), 10) : null;
    }

    field[property] = resolved;

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

  duplicateField(fieldId: string): void {
    const field = this.state.fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newField: FormField = {
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

  deleteField(fieldId: string): void {
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

  private switchTab(tab: string): void {
    // Update tab buttons
    this.element.querySelectorAll('.aiab-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === tab);
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

  private showPreview(): void {
    if (!this.preview) return;

    const form = document.createElement('form');
    form.className = 'aiab-preview-form';

    this.state.fields.forEach((field) => {
      const fieldEl = this.createPreviewField(field);
      form.appendChild(fieldEl);
    });

    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn aiab-btn-primary';
    submitBtn.textContent = 'Submit';

    form.appendChild(submitBtn);

    form.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      const formData = new FormData(form);
      if (this.options.onSubmit) {
        this.options.onSubmit(Object.fromEntries(formData) as Record<string, FormDataEntryValue>);
      }
    });

    this.preview.innerHTML = '';
    this.preview.appendChild(form);
  }

  private createPreviewField(field: FormField): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'aiab-form-group';

    switch (field.type) {
      case 'heading': {
        const heading = document.createElement(field.level || 'h3');
        heading.textContent = field.text || '';
        wrapper.appendChild(heading);
        break;
      }

      case 'paragraph': {
        const p = document.createElement('p');
        p.textContent = field.text || '';
        wrapper.appendChild(p);
        break;
      }

      case 'divider': {
        const hr = document.createElement('hr');
        wrapper.appendChild(hr);
        break;
      }

      case 'spacer':
        wrapper.style.height = `${field.height || 24}px`;
        break;

      case 'html':
        wrapper.innerHTML = this._sanitizeHTML(field.content || '');
        break;

      default: {
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
    }

    return wrapper;
  }

  private createFormInput(field: FormField): HTMLElement {
    let input: HTMLElement;

    switch (field.type) {
      case 'textarea': {
        const ta = document.createElement('textarea');
        ta.name = field.name || '';
        ta.placeholder = field.placeholder || '';
        ta.rows = field.rows || 4;
        ta.required = field.required || false;
        input = ta;
        break;
      }

      case 'select': {
        const sel = document.createElement('select');
        sel.name = field.name || '';
        sel.required = field.required || false;
        sel.multiple = field.multiple || false;

        if (field.placeholder) {
          const placeholder = document.createElement('option');
          placeholder.value = '';
          placeholder.textContent = field.placeholder;
          placeholder.disabled = true;
          placeholder.selected = true;
          sel.appendChild(placeholder);
        }

        field.options?.forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.label;
          sel.appendChild(option);
        });
        input = sel;
        break;
      }

      case 'radio': {
        const radioGroup = document.createElement('div');
        radioGroup.className = 'aiab-radio-group';
        field.options?.forEach((opt, index) => {
          const label = document.createElement('label');
          label.className = 'radio-label';

          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = field.name || '';
          radio.value = opt.value;
          radio.required = (field.required || false) && index === 0;

          const span = document.createElement('span');
          span.textContent = opt.label;

          label.appendChild(radio);
          label.appendChild(span);
          radioGroup.appendChild(label);
        });
        input = radioGroup;
        break;
      }

      case 'checkbox': {
        const cbLabel = document.createElement('label');
        cbLabel.className = 'checkbox-label';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = field.name || '';
        checkbox.value = String(field.value || 'on');
        checkbox.required = field.required || false;

        const span = document.createElement('span');
        span.textContent = field.label || '';

        cbLabel.appendChild(checkbox);
        cbLabel.appendChild(span);
        input = cbLabel;
        break;
      }

      case 'switch': {
        const swLabel = document.createElement('label');
        swLabel.className = 'aiab-switch-label';

        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.name = field.name || '';
        switchInput.value = 'on';

        const switchEl = document.createElement('span');
        switchEl.className = 'switch';
        const slider = document.createElement('span');
        slider.className = 'aiab-switch-slider';
        switchEl.appendChild(slider);

        const text = document.createElement('span');
        text.textContent = field.label || '';

        swLabel.appendChild(switchInput);
        swLabel.appendChild(switchEl);
        swLabel.appendChild(text);
        input = swLabel;
        break;
      }

      case 'file': {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = field.name || '';
        fileInput.accept = field.accept || '*';
        fileInput.multiple = field.multiple || false;
        fileInput.required = field.required || false;
        input = fileInput;
        break;
      }

      default: {
        const defaultInput = document.createElement('input');
        defaultInput.type = field.type;
        defaultInput.name = field.name || '';
        defaultInput.placeholder = field.placeholder || '';
        defaultInput.required = field.required || false;

        if (field.min !== undefined && field.min !== null) defaultInput.min = String(field.min);
        if (field.max !== undefined && field.max !== null) defaultInput.max = String(field.max);
        if (field.step !== undefined) defaultInput.step = String(field.step);
        if (field.value !== undefined) defaultInput.value = String(field.value);
        if (field.pattern) defaultInput.pattern = field.pattern;
        if (field.minLength) defaultInput.minLength = field.minLength;
        if (field.maxLength) defaultInput.maxLength = field.maxLength;
        input = defaultInput;
        break;
      }
    }

    return input;
  }

  private handleKeyboard(e: KeyboardEvent): void {
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

  private saveHistory(): void {
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

  undo(): void {
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      this.state.fields = JSON.parse(this.state.history[this.state.historyIndex]) as FormField[];
      this.renderFields();
    }
  }

  redo(): void {
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.historyIndex++;
      this.state.fields = JSON.parse(this.state.history[this.state.historyIndex]) as FormField[];
      this.renderFields();
    }
  }

  clearForm(): void {
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

  saveForm(): void {
    const formData: FormExportData = {
      fields: this.state.fields,
      settings: {
        multiStep: this.options.enableMultiStep,
        validation: this.options.enableValidation,
      },
      version: '1.0',
      created: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem('aiab-form-builder-data', JSON.stringify(formData));

    // Trigger callback
    if (this.options.onSave) {
      this.options.onSave(formData);
    } else {
      alert('Form saved successfully!');
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('aiab-form-builder-data');
      if (stored) {
        const data = JSON.parse(stored) as FormExportData;
        this.state.fields = data.fields || [];
        this.renderFields();
        this.saveHistory();
      }
    } catch (e) {
      console.error('Failed to load form data:', e);
    }
  }

  importForm(): void {
    this.fileInput.click();
  }

  private handleFileImport(e: Event): void {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const data = JSON.parse(event.target?.result as string) as FormExportData;
        this.state.fields = data.fields || [];
        this.renderFields();
        this.saveHistory();
        alert('Form imported successfully!');
      } catch (_error) {
        alert('Failed to import form. Invalid JSON file.');
      }
    };
    reader.readAsText(file);

    // Clear file input
    target.value = '';
  }

  exportForm(): void {
    const formData: FormExportData = {
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

  loadTemplate(templateId: string): void {
    const template = this.options.templates.find((t) => t.id === templateId);
    if (!template) return;

    this.state.fields = [...template.fields];
    this.renderFields();
    this.saveHistory();
  }

  private startAutoSave(): void {
    const autoSaveTimer = setInterval(() => {
      this.saveForm();
    }, this.options.autoSaveInterval);

    this.timers.add(autoSaveTimer);
  }

  // Multi-step form methods
  previousStep(): void {
    if (this.state.currentStep > 0) {
      this.state.currentStep--;
      this.updateStepDisplay();
    }
  }

  nextStep(): void {
    // Validate current step before proceeding
    if (this.validateStep(this.state.currentStep)) {
      this.state.currentStep++;
      this.updateStepDisplay();
    }
  }

  addStep(): void {
    // TODO: Implementation for adding new step
  }

  private validateStep(_stepIndex: number): boolean {
    // Basic validation - can be enhanced
    return true;
  }

  private updateStepDisplay(): void {
    if (!this.stepNav) return;

    const indicator = this.stepNav.querySelector('.aiab-step-indicator') as HTMLElement | null;
    if (indicator) {
      indicator.textContent = `Step ${this.state.currentStep + 1} of ${this.getTotalSteps()}`;
    }

    const prevBtn = this.stepNav.querySelector('.prev') as HTMLButtonElement | null;
    const nextBtn = this.stepNav.querySelector('.next') as HTMLButtonElement | null;

    if (prevBtn) {
      prevBtn.disabled = this.state.currentStep === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.state.currentStep >= this.getTotalSteps() - 1;
    }
  }

  private getTotalSteps(): number {
    // For now, treat entire form as single step
    // Can be enhanced to support actual multi-step forms
    return 1;
  }

  private formatCategory(category: string): string {
    const labels: Record<string, string> = {
      input: 'Basic Inputs',
      text: 'Text Areas',
      selection: 'Selection',
      datetime: 'Date & Time',
      special: 'Special Inputs',
      layout: 'Layout Elements',
    };

    return labels[category] || category;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  // Public API
  getFormData(): FormDataResult {
    return {
      fields: this.state.fields,
      settings: {
        multiStep: this.options.enableMultiStep,
        validation: this.options.enableValidation,
      },
    };
  }

  setFormData(data: Partial<FormExportData>): void {
    if (data.fields) {
      this.state.fields = data.fields;
      this.renderFields();
      this.saveHistory();
    }
  }

  addFieldType(type: string, definition: FieldDefinition): void {
    this.fieldDefinitions[type] = definition;
    this.options.fieldTypes.push(type);
    this.setupDOM(); // Re-render toolbox
  }

  destroy(): void {
    // Clear timers
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();

    // Remove event handlers
    this.handlers.forEach(({ element, type, handler }) => {
      (element as HTMLElement).removeEventListener(type, handler);
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

// ---------------------------------------------------------------------------
// Window global
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    FormBuilder: typeof FormBuilder;
  }
}

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    document.querySelectorAll('[data-form-builder]').forEach((element) => {
      new FormBuilder(element as HTMLElement);
    });
  } catch (error) {
    console.error('[Amphibious] FormBuilder auto-init failed:', error);
  }
});

// Register with component registry if available
// biome-ignore lint/suspicious/noExplicitAny: component registry accepts heterogeneous constructors
if ((window as any).AmphibiousRegistry) {
  // biome-ignore lint/suspicious/noExplicitAny: component registry accepts heterogeneous constructors
  (window as any).AmphibiousRegistry.registerComponent('aiab-form-builder', FormBuilder);
}

// Export
window.FormBuilder = FormBuilder;
export default FormBuilder;
export { FormBuilder };
