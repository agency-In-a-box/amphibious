/**
 * Tabs Module - Amphibious 2.0
 * Interactive tab switching functionality
 */

export class Tabs {
  private containers: NodeListOf<HTMLElement>;

  constructor() {
    this.containers = document.querySelectorAll('.tabs, [data-tabs]');
  }

  /**
   * Initialize tabs functionality
   */
  init(): void {
    this.containers.forEach((container) => {
      this.setupTabs(container);
    });

    // Initialize tabs from data attributes (legacy support)
    this.setupLegacyTabs();
  }

  /**
   * Setup tabs for a container
   */
  private setupTabs(container: HTMLElement): void {
    const tabList = container.querySelector('.tabs__list, [role="tablist"]') as HTMLElement;
    const tabs = container.querySelectorAll('.tabs__tab, [role="tab"]');
    const panels = container.querySelectorAll('.tabs__panel, [role="tabpanel"]');

    if (!tabList || tabs.length === 0 || panels.length === 0) return;

    // Set initial ARIA attributes
    tabs.forEach((tab, index) => {
      const tabElement = tab as HTMLElement;
      const panel = panels[index] as HTMLElement;

      // Set IDs if not present
      if (!tabElement.id) {
        tabElement.id = `tab-${Math.random().toString(36).substr(2, 9)}`;
      }
      if (!panel.id) {
        panel.id = `panel-${Math.random().toString(36).substr(2, 9)}`;
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
        tabElement.classList.add('is-active', 'tabs__tab--active');
        panel.classList.add('is-active', 'tabs__panel--active');
      } else {
        panel.classList.remove('is-active', 'tabs__panel--active');
        panel.style.display = 'none';
      }

      // Add click handler
      tabElement.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectTab(container, tabElement, panel);
      });

      // Add keyboard navigation
      tabElement.addEventListener('keydown', (e) => {
        this.handleKeyboardNav(e, container, tabs, index);
      });
    });

    // Ensure tablist has proper role
    tabList.setAttribute('role', 'tablist');
  }

  /**
   * Select a tab and show its panel
   */
  private selectTab(container: HTMLElement, tab: HTMLElement, panel: HTMLElement): void {
    // Deactivate all tabs and panels
    const allTabs = container.querySelectorAll('[role="tab"], .tabs__tab');
    const allPanels = container.querySelectorAll('[role="tabpanel"], .tabs__panel');

    allTabs.forEach((t) => {
      const tabEl = t as HTMLElement;
      tabEl.classList.remove('is-active', 'tabs__tab--active');
      tabEl.setAttribute('aria-selected', 'false');
      tabEl.setAttribute('tabindex', '-1');
    });

    allPanels.forEach((p) => {
      const panelEl = p as HTMLElement;
      panelEl.classList.remove('is-active', 'tabs__panel--active');
      panelEl.style.display = 'none';
    });

    // Activate selected tab and panel
    tab.classList.add('is-active', 'tabs__tab--active');
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.focus();

    panel.classList.add('is-active', 'tabs__panel--active');
    panel.style.display = 'block';

    // Dispatch custom event
    const event = new CustomEvent('tab:change', {
      detail: { tab, panel },
      bubbles: true,
    });
    container.dispatchEvent(event);
  }

  /**
   * Handle keyboard navigation
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
   * Setup legacy tabs using data attributes
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
      tabElement.addEventListener('click', (e) => {
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
              tElement.classList.remove('active', 'is-active');
            }
          }
        });

        // Show selected panel
        panel.style.display = 'block';
        tabElement.classList.add('active', 'is-active');
      });

      // Activate first tab in group
      const group = tabElement.getAttribute('amp-tab-group') || 'default';
      const isFirst = tabElement === document.querySelector(`[amp-tab-group="${group}"]`);
      if (isFirst) {
        panel.style.display = 'block';
        tabElement.classList.add('active', 'is-active');
      }
    });
  }

  /**
   * Programmatically select a tab
   */
  public selectTabByIndex(containerSelector: string, index: number): void {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    const tabs = container.querySelectorAll('[role="tab"], .tabs__tab');
    const panels = container.querySelectorAll('[role="tabpanel"], .tabs__panel');

    if (index >= 0 && index < tabs.length) {
      this.selectTab(container, tabs[index] as HTMLElement, panels[index] as HTMLElement);
    }
  }

  /**
   * Get currently active tab
   */
  public getActiveTab(containerSelector: string): HTMLElement | null {
    const container = document.querySelector(containerSelector);
    if (!container) return null;

    return container.querySelector('.is-active[role="tab"], .tabs__tab--active');
  }
}

export default Tabs;
