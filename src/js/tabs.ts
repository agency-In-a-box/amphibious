/**
 * Tabs Module - Amphibious 2.0
 * Interactive tab switching functionality
 */

/**
 * Accessible tab component with ARIA roles, keyboard navigation,
 * and support for both modern `.aiab-tabs` markup and legacy
 * `[amp-tab-content]` data-attribute patterns.
 *
 * Automatically discovers all `.aiab-tabs` and `[data-tabs]` containers
 * in the DOM at construction time.
 *
 * @fires tab:change - CustomEvent dispatched on the container when a tab is selected.
 *                     Detail contains `{ tab: HTMLElement, panel: HTMLElement }`.
 *
 * @example
 * ```ts
 * const tabs = new Tabs();
 * tabs.init();
 *
 * // Programmatic selection
 * tabs.selectTabByIndex('.aiab-tabs', 2);
 *
 * // Clean up
 * tabs.destroy();
 * ```
 */
export class Tabs {
  private containers: NodeListOf<HTMLElement>;
  private abortController: AbortController;

  constructor() {
    this.containers = document.querySelectorAll('.aiab-tabs, [data-tabs]');
    this.abortController = new AbortController();
  }

  /**
   * Initialize all tab containers and legacy tab patterns.
   * Sets ARIA attributes, click handlers, and keyboard navigation on each container.
   */
  init(): void {
    this.containers.forEach((container) => {
      this.setupTabs(container);
    });

    // Initialize tabs from data attributes (legacy support)
    this.setupLegacyTabs();
  }

  /**
   * Wire up a single tab container: assign ARIA roles/attributes to tabs and
   * panels, set the first tab as active, and attach click and keyboard handlers.
   * @param container - The `.aiab-tabs` or `[data-tabs]` wrapper element.
   */
  private setupTabs(container: HTMLElement): void {
    const tabList = container.querySelector('.aiab-tabs__list, [role="tablist"]') as HTMLElement;
    const tabs = container.querySelectorAll('.aiab-tabs__tab, [role="tab"]');
    const panels = container.querySelectorAll('.aiab-tabs__panel, [role="tabpanel"]');

    if (!tabList || tabs.length === 0 || panels.length === 0) return;

    // Set initial ARIA attributes
    tabs.forEach((tab, index) => {
      const tabElement = tab as HTMLElement;
      const panel = panels[index] as HTMLElement;

      // Set IDs if not present
      if (!tabElement.id) {
        tabElement.id = `tab-${Math.random().toString(36).substring(2, 11)}`;
      }
      if (!panel.id) {
        panel.id = `panel-${Math.random().toString(36).substring(2, 11)}`;
      }

      // Set ARIA attributes
      tabElement.setAttribute('role', 'tab');
      tabElement.setAttribute('aria-controls', panel.id);
      tabElement.setAttribute('tabindex', index === 0 ? '0' : '-1');
      tabElement.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabElement.id);
      panel.setAttribute('tabindex', '0');

      // Set initial state
      if (index === 0) {
        tabElement.classList.add('aiab-is-active', 'aiab-tabs__tab--active');
        panel.classList.add('aiab-is-active', 'aiab-tabs__panel--active');
      } else {
        panel.classList.remove('aiab-is-active', 'aiab-tabs__panel--active');
        panel.style.display = 'none';
      }

      // Add click handler
      tabElement.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          this.selectTab(container, tabElement, panel);
        },
        { signal: this.abortController.signal },
      );

      // Add keyboard navigation
      tabElement.addEventListener(
        'keydown',
        (e) => {
          this.handleKeyboardNav(e, container, tabs, index);
        },
        { signal: this.abortController.signal },
      );
    });

    // Ensure tablist has proper role
    tabList.setAttribute('role', 'tablist');
  }

  /**
   * Activate the given tab and its associated panel, deactivating all others
   * within the same container. Dispatches a `tab:change` CustomEvent.
   * @param container - Parent tab container element.
   * @param tab - The tab element to activate.
   * @param panel - The panel element to reveal.
   */
  private selectTab(container: HTMLElement, tab: HTMLElement, panel: HTMLElement): void {
    // Deactivate all tabs and panels
    const allTabs = container.querySelectorAll('[role="tab"], .aiab-tabs__tab');
    const allPanels = container.querySelectorAll('[role="tabpanel"], .aiab-tabs__panel');

    allTabs.forEach((t) => {
      const tabEl = t as HTMLElement;
      tabEl.classList.remove('aiab-is-active', 'aiab-tabs__tab--active');
      tabEl.setAttribute('aria-selected', 'false');
      tabEl.setAttribute('tabindex', '-1');
    });

    allPanels.forEach((p) => {
      const panelEl = p as HTMLElement;
      panelEl.classList.remove('aiab-is-active', 'aiab-tabs__panel--active');
      panelEl.style.display = 'none';
    });

    // Activate selected tab and panel
    tab.classList.add('aiab-is-active', 'aiab-tabs__tab--active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.focus();

    panel.classList.add('aiab-is-active', 'aiab-tabs__panel--active');
    panel.style.display = 'block';

    // Dispatch custom event
    const event = new CustomEvent('tab:change', {
      detail: { tab, panel },
      bubbles: true,
    });
    container.dispatchEvent(event);
  }

  /**
   * Handle arrow key, Home, and End keyboard navigation between tabs.
   * Wraps around at boundaries (last to first and vice versa).
   * @param e - The keyboard event.
   * @param container - Parent tab container.
   * @param tabs - NodeList of all tab elements in the container.
   * @param currentIndex - Zero-based index of the currently focused tab.
   */
  private handleKeyboardNav(
    e: KeyboardEvent,
    container: HTMLElement,
    tabs: NodeListOf<Element>,
    currentIndex: number,
  ): void {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = tabs.length - 1;
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= tabs.length) newIndex = 0;
        break;

      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;

      default:
        return;
    }

    const newTab = tabs[newIndex] as HTMLElement;
    const panelId = newTab.getAttribute('aria-controls');
    const newPanel = container.querySelector(`#${panelId}`) as HTMLElement;

    if (newPanel) {
      this.selectTab(container, newTab, newPanel);
    }
  }

  /**
   * Initialize tabs that use the legacy `[amp-tab-content]` / `[amp-tab-group]`
   * data-attribute pattern from Amphibious 1.x. Groups are identified by the
   * `amp-tab-group` attribute; the first tab in each group is auto-activated.
   */
  private setupLegacyTabs(): void {
    // Support for amp-tab-content attributes from original
    const legacyTabs = document.querySelectorAll('[amp-tab-content]');

    legacyTabs.forEach((tab) => {
      const tabElement = tab as HTMLElement;
      const contentId = tabElement.getAttribute('amp-tab-content');
      if (!contentId) return;

      const panel = document.querySelector(contentId) as HTMLElement;
      if (!panel) return;

      // Hide panel initially
      panel.style.display = 'none';

      // Add click handler
      tabElement.addEventListener(
        'click',
        (e) => {
          e.preventDefault();

          // Hide all panels with same group
          const group = tabElement.getAttribute('amp-tab-group') || 'default';
          const groupTabs = document.querySelectorAll(`[amp-tab-group="${group}"]`);

          groupTabs.forEach((t) => {
            const tElement = t as HTMLElement;
            const tContentId = tElement.getAttribute('amp-tab-content');
            if (tContentId) {
              const tPanel = document.querySelector(tContentId) as HTMLElement;
              if (tPanel) {
                tPanel.style.display = 'none';
                tElement.classList.remove('aiab-active', 'aiab-is-active');
              }
            }
          });

          // Show selected panel
          panel.style.display = 'block';
          tabElement.classList.add('aiab-active', 'aiab-is-active');
        },
        { signal: this.abortController.signal },
      );

      // Activate first tab in group
      const group = tabElement.getAttribute('amp-tab-group') || 'default';
      const isFirst = tabElement === document.querySelector(`[amp-tab-group="${group}"]`);
      if (isFirst) {
        panel.style.display = 'block';
        tabElement.classList.add('aiab-active', 'aiab-is-active');
      }
    });
  }

  /**
   * Programmatically select a tab by its zero-based index within a container.
   *
   * @param containerSelector - CSS selector for the tab container.
   * @param index - Zero-based index of the tab to activate.
   *
   * @example
   * ```ts
   * tabs.selectTabByIndex('#my-tabs', 2); // Activate the third tab
   * ```
   */
  public selectTabByIndex(containerSelector: string, index: number): void {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    const tabs = container.querySelectorAll('[role="tab"], .aiab-tabs__tab');
    const panels = container.querySelectorAll('[role="tabpanel"], .aiab-tabs__panel');

    if (index >= 0 && index < tabs.length) {
      this.selectTab(container, tabs[index] as HTMLElement, panels[index] as HTMLElement);
    }
  }

  /**
   * Get the currently active tab element within a container.
   *
   * @param containerSelector - CSS selector for the tab container.
   * @returns The active tab HTMLElement, or `null` if not found.
   */
  public getActiveTab(containerSelector: string): HTMLElement | null {
    const container = document.querySelector(containerSelector);
    if (!container) return null;

    return container.querySelector('.aiab-is-active[role="tab"], .aiab-tabs__tab--active');
  }
  /**
   * Abort all event listeners attached via this Tabs instance.
   * Uses the internal AbortController signal, so all listeners are
   * cleaned up in a single call.
   */
  public destroy(): void {
    this.abortController.abort();
  }
}

export default Tabs;
