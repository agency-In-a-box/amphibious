/**
 * Sidebar Module - Amphibious 2.0
 * Enhances `.aiab-sidebar` markup (see organisms/sidebar.css).
 *
 * - Desktop: the sidebar is visible and can be collapsed / expanded.
 * - Mobile (at or below the breakpoint): the sidebar is an overlay that opens / closes.
 *
 * `toggle()` does the right thing for the current viewport. State changes are
 * announced with bubbling CustomEvents on the sidebar element: `sidebarOpened`,
 * `sidebarClosed`, `sidebarCollapsed`, `sidebarExpanded`.
 */

export interface SidebarOptions {
  /** Viewport width (px) at or below which the sidebar is an overlay. Default 768 (`--bp-md-down`). */
  breakpoint?: number;
}

const OPEN = 'aiab-sidebar--open';
const COLLAPSED = 'aiab-sidebar--collapsed';
const MOBILE = 'aiab-sidebar--mobile';
const OVERLAY = 'aiab-sidebar__overlay';
const ACTIVE_LINK = 'aiab-sidebar__link--active';

type SidebarElement = HTMLElement & { _sidebar?: Sidebar };

export class Sidebar {
  readonly element: SidebarElement;
  private readonly breakpoint: number;
  private overlay: HTMLElement | null = null;
  private opened = false;
  private collapsed = false;
  private listeners: Array<{
    el: EventTarget;
    type: string;
    handler: EventListener;
  }> = [];

  /** @throws If the element or selector is not found. */
  constructor(element: string | HTMLElement, options: SidebarOptions = {}) {
    const root =
      typeof element === 'string' ? document.querySelector<HTMLElement>(element) : element;
    if (!root) throw new Error(`[Amphibious] Sidebar element not found: ${String(element)}`);

    (root as SidebarElement)._sidebar?.destroy();
    this.element = root as SidebarElement;
    this.breakpoint = options.breakpoint ?? 768;
    this.collapsed = root.classList.contains(COLLAPSED);
    this.opened = root.classList.contains(OPEN);
    this.element._sidebar = this;

    this.applyViewport();
    this.bind();
  }

  /** Whether the sidebar is currently shown: open on mobile, not collapsed on desktop. */
  get isOpen(): boolean {
    return this.isMobile() ? this.opened : !this.collapsed;
  }

  get isCollapsed(): boolean {
    return this.collapsed;
  }

  /** Mobile: open or close the overlay. Desktop: collapse or expand. */
  toggle(): void {
    if (this.isMobile()) this.opened ? this.close() : this.open();
    else this.collapsed ? this.expand() : this.collapse();
  }

  /** Open the sidebar overlay (mobile). */
  open(): void {
    if (this.opened) return;
    this.opened = true;
    this.element.classList.add(OPEN);
    this.ensureOverlay().classList.add('aiab-is-open');
    this.emit('sidebarOpened');
  }

  /** Close the sidebar overlay (mobile). */
  close(): void {
    if (!this.opened) return;
    this.opened = false;
    this.element.classList.remove(OPEN);
    this.overlay?.classList.remove('aiab-is-open');
    this.emit('sidebarClosed');
  }

  /** Collapse to the narrow rail (desktop). */
  collapse(): void {
    if (this.collapsed) return;
    this.collapsed = true;
    this.element.classList.add(COLLAPSED);
    this.emit('sidebarCollapsed');
  }

  /** Expand to full width (desktop). */
  expand(): void {
    if (!this.collapsed) return;
    this.collapsed = false;
    this.element.classList.remove(COLLAPSED);
    this.emit('sidebarExpanded');
  }

  /** Mark the link with this `href` as the current one. */
  setActiveLink(href: string): void {
    this.element.querySelectorAll<HTMLElement>('.aiab-sidebar__link').forEach((link) => {
      const active = link.getAttribute('href') === href;
      link.classList.toggle(ACTIVE_LINK, active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  destroy(): void {
    for (const { el, type, handler } of this.listeners) el.removeEventListener(type, handler);
    this.listeners = [];
    this.overlay?.remove();
    this.overlay = null;
    if (this.element._sidebar === this) delete this.element._sidebar;
  }

  private isMobile(): boolean {
    return window.innerWidth <= this.breakpoint;
  }

  private applyViewport(): void {
    const mobile = this.isMobile();
    this.element.classList.toggle(MOBILE, mobile);
    if (!mobile && this.opened) {
      this.opened = false;
      this.element.classList.remove(OPEN);
      this.overlay?.classList.remove('aiab-is-open');
    }
  }

  private ensureOverlay(): HTMLElement {
    if (!this.overlay) {
      const overlay = document.createElement('div');
      overlay.className = OVERLAY;
      overlay.setAttribute('aria-hidden', 'true');
      this.element.after(overlay);
      this.on(overlay, 'click', () => this.close());
      this.overlay = overlay;
    }
    return this.overlay;
  }

  private emit(name: string): void {
    this.element.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { sidebar: this } }));
  }

  private on(el: EventTarget, type: string, handler: EventListener): void {
    el.addEventListener(type, handler);
    this.listeners.push({ el, type, handler });
  }

  private bind(): void {
    // Header-side hamburger buttons anywhere on the page
    document.querySelectorAll('[data-sidebar-toggle]').forEach((btn) => {
      this.on(btn, 'click', () => this.toggle());
    });
    // The collapse / close button inside the sidebar header
    const inner = this.element.querySelector('.aiab-sidebar__toggle');
    if (inner) this.on(inner, 'click', () => this.toggle());

    this.on(document, 'keydown', (event) => {
      if ((event as KeyboardEvent).key === 'Escape' && this.isMobile()) this.close();
    });
    this.on(window, 'resize', () => this.applyViewport());
  }
}

/** Enhance every `.aiab-sidebar` on the page that has no instance yet. */
export function initSidebars(root: ParentNode = document): Sidebar[] {
  const created: Sidebar[] = [];
  root.querySelectorAll<SidebarElement>('.aiab-sidebar').forEach((el) => {
    if (!el._sidebar) created.push(new Sidebar(el));
  });
  return created;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initSidebars());
  } else {
    initSidebars();
  }
}

export default Sidebar;
