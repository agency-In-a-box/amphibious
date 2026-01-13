/**
 * Component Registry System
 * Centralized management for all Amphibious components
 * Handles lifecycle, initialization, and cleanup
 * Part of Amphibious 2.0 Component Library
 */

class ComponentRegistry {
  constructor() {
    // Map of component instances by ID
    this.components = new Map();

    // Map of component constructors by type
    this.componentTypes = new Map();

    // Global configuration
    this.config = {
      autoInit: true,
      debug: false,
      namespace: 'amphibious',
      initAttribute: 'data-component',
      lazyLoad: false,
    };

    // Component lifecycle hooks
    this.hooks = {
      beforeInit: [],
      afterInit: [],
      beforeDestroy: [],
      afterDestroy: [],
    };

    // Performance metrics
    this.metrics = {
      initialized: 0,
      destroyed: 0,
      errors: 0,
      initTime: 0,
    };

    // Mutation observer for dynamic content
    this.observer = null;

    // Initialize on DOM ready
    this.init();
  }

  /**
   * Initialize the registry
   */
  init() {
    // Wait for DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Setup registry and auto-initialize components
   */
  setup() {
    // Register built-in components
    this.registerBuiltInComponents();

    // Auto-initialize if enabled
    if (this.config.autoInit) {
      this.initializeAll();
    }

    // Setup mutation observer for dynamic content
    this.setupObserver();

    // Setup global cleanup on page unload
    window.addEventListener('beforeunload', () => this.destroyAll());
  }

  /**
   * Register all built-in Amphibious components
   */
  registerBuiltInComponents() {
    // Import and register each component
    const components = [
      { type: 'accordion', ComponentClass: window.Accordion },
      { type: 'datepicker', ComponentClass: window.DatePicker },
      { type: 'dropdown', ComponentClass: window.Dropdown },
      { type: 'file-upload', ComponentClass: window.FileUpload },
      { type: 'modal', ComponentClass: window.ModalComponent },
      { type: 'navigation', ComponentClass: window.NavigationComponent },
      { type: 'search-bar', ComponentClass: window.SearchBar },
      { type: 'toast', ComponentClass: window.ToastComponent },
      { type: 'data-table', ComponentClass: window.DataTableComponent },
    ];

    components.forEach(({ type, ComponentClass }) => {
      if (ComponentClass) {
        this.registerComponent(type, ComponentClass);
      }
    });
  }

  /**
   * Register a component type
   */
  registerComponent(type, ComponentClass, config = {}) {
    if (this.componentTypes.has(type)) {
      this.log(`Component type "${type}" already registered`, 'warn');
      return;
    }

    this.componentTypes.set(type, {
      constructor: ComponentClass,
      config: {
        selector: config.selector || `[data-${type}]`,
        autoInit: config.autoInit !== false,
        singleton: config.singleton || false,
        ...config,
      },
    });

    this.log(`Registered component type: ${type}`);
  }

  /**
   * Initialize all components in the DOM
   */
  initializeAll(root = document) {
    const startTime = performance.now();

    this.componentTypes.forEach((componentDef, type) => {
      if (componentDef.config.autoInit) {
        const elements = root.querySelectorAll(componentDef.config.selector);
        elements.forEach((element) => {
          this.createComponent(type, element);
        });
      }
    });

    this.metrics.initTime = performance.now() - startTime;
    this.log(`Initialized all components in ${this.metrics.initTime.toFixed(2)}ms`);
  }

  /**
   * Create a component instance
   */
  createComponent(type, element, options = {}) {
    // Check if component type is registered
    const componentDef = this.componentTypes.get(type);
    if (!componentDef) {
      this.log(`Unknown component type: ${type}`, 'error');
      this.metrics.errors++;
      return null;
    }

    // Check if element already has a component
    const existingId = element.dataset.componentId;
    if (existingId && this.components.has(existingId)) {
      this.log(`Element already has component: ${existingId}`, 'warn');
      return this.components.get(existingId);
    }

    // Generate unique ID
    const id = this.generateId(type);

    // Parse options from data attributes
    const dataOptions = this.parseDataAttributes(element, type);
    const mergedOptions = { ...dataOptions, ...options };

    try {
      // Run beforeInit hooks
      this.runHooks('beforeInit', { type, element, options: mergedOptions });

      // Create component instance
      const instance = new componentDef.constructor(element, mergedOptions);

      // Store component reference
      const componentRef = {
        id,
        type,
        element,
        instance,
        options: mergedOptions,
        created: Date.now(),
      };

      this.components.set(id, componentRef);
      element.dataset.componentId = id;

      // Run afterInit hooks
      this.runHooks('afterInit', componentRef);

      this.metrics.initialized++;
      this.log(`Created ${type} component: ${id}`);

      return instance;
    } catch (error) {
      this.log(`Failed to create ${type} component: ${error.message}`, 'error');
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Destroy a component instance
   */
  destroyComponent(idOrElement) {
    const id = typeof idOrElement === 'string' ? idOrElement : idOrElement.dataset?.componentId;

    if (!id || !this.components.has(id)) {
      this.log(`Component not found: ${id}`, 'warn');
      return false;
    }

    const componentRef = this.components.get(id);

    try {
      // Run beforeDestroy hooks
      this.runHooks('beforeDestroy', componentRef);

      // Call component's destroy method if it exists
      if (typeof componentRef.instance.destroy === 'function') {
        componentRef.instance.destroy();
      }

      // Clean up DOM
      delete componentRef.element.dataset.componentId;

      // Remove from registry
      this.components.delete(id);

      // Run afterDestroy hooks
      this.runHooks('afterDestroy', componentRef);

      this.metrics.destroyed++;
      this.log(`Destroyed ${componentRef.type} component: ${id}`);

      return true;
    } catch (error) {
      this.log(`Failed to destroy component ${id}: ${error.message}`, 'error');
      this.metrics.errors++;
      return false;
    }
  }

  /**
   * Destroy all components
   */
  destroyAll() {
    const ids = Array.from(this.components.keys());
    ids.forEach((id) => this.destroyComponent(id));
    this.log(`Destroyed all ${ids.length} components`);
  }

  /**
   * Get component instance by ID or element
   */
  getComponent(idOrElement) {
    if (typeof idOrElement === 'string') {
      return this.components.get(idOrElement)?.instance;
    }

    const id = idOrElement.dataset?.componentId;
    return id ? this.components.get(id)?.instance : null;
  }

  /**
   * Get all components of a specific type
   */
  getComponentsByType(type) {
    const components = [];
    this.components.forEach((ref) => {
      if (ref.type === type) {
        components.push(ref.instance);
      }
    });
    return components;
  }

  /**
   * Setup mutation observer for dynamic content
   */
  setupObserver() {
    if (!window.MutationObserver || !this.config.autoInit) return;

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Handle added nodes
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.initializeAll(node);
          }
        });

        // Handle removed nodes
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Find and destroy components in removed subtree
            const components = node.querySelectorAll('[data-component-id]');
            components.forEach((element) => {
              this.destroyComponent(element);
            });
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Parse data attributes for component options
   */
  parseDataAttributes(element, type) {
    const options = {};
    const prefix = `data-${type}-`;

    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith(prefix)) {
        const key = attr.name
          .slice(prefix.length)
          .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

        // Try to parse JSON values
        let value = attr.value;
        try {
          value = JSON.parse(value);
        } catch {
          // Keep as string if not valid JSON
          if (value === 'true') value = true;
          if (value === 'false') value = false;
          if (!Number.isNaN(value) && value !== '') value = Number(value);
        }

        options[key] = value;
      }
    });

    return options;
  }

  /**
   * Add a lifecycle hook
   */
  addHook(event, callback) {
    if (!this.hooks[event]) {
      this.log(`Unknown hook event: ${event}`, 'warn');
      return;
    }
    this.hooks[event].push(callback);
  }

  /**
   * Run lifecycle hooks
   */
  runHooks(event, data) {
    if (!this.hooks[event]) return;

    this.hooks[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        this.log(`Hook error in ${event}: ${error.message}`, 'error');
      }
    });
  }

  /**
   * Generate unique component ID
   */
  generateId(type) {
    return `${this.config.namespace}-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configure the registry
   */
  configure(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get registry metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      active: this.components.size,
      types: this.componentTypes.size,
    };
  }

  /**
   * Debug helper to list all components
   */
  listComponents() {
    const list = [];
    this.components.forEach((ref, id) => {
      list.push({
        id,
        type: ref.type,
        element: ref.element,
        created: new Date(ref.created).toISOString(),
      });
    });
    return list;
  }

  /**
   * Logging helper
   */
  log(message, level = 'info') {
    if (!this.config.debug) return;

    const prefix = '[Amphibious Registry]';

    switch (level) {
      case 'error':
        // Error logging disabled for production
        break;
      case 'warn':
        // Warning logging disabled for production
        break;
      default:
        // Info logging disabled for production
        break;
    }
  }

  /**
   * Cleanup and destroy registry
   */
  destroy() {
    // Destroy all components
    this.destroyAll();

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Clear all data
    this.components.clear();
    this.componentTypes.clear();
    this.hooks = {
      beforeInit: [],
      afterInit: [],
      beforeDestroy: [],
      afterDestroy: [],
    };
  }
}

// Create global registry instance
window.AmphibiousRegistry = new ComponentRegistry();

// Export for module usage
export default ComponentRegistry;
export { ComponentRegistry };
