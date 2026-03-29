/**
 * Timeline Component
 * Interactive aiab-timeline for displaying chronological events
 * Part of Amphibious 2.0 Component Library
 *
 * Features:
 * - Horizontal and vertical layouts
 * - Multiple aiab-timeline styles (default, centered, branching)
 * - Interactive events with details
 * - Filtering and grouping
 * - Zoom and pan controls
 * - Animated transitions
 * - Milestone markers
 * - Date range selection
 */

/** Orientation of the timeline track. */
export type TimelineOrientation = 'vertical' | 'horizontal';

/** Layout style for timeline rendering. */
export type TimelineLayout = 'default' | 'centered' | 'branching' | 'compact';

/**
 * A link attached to event details.
 *
 * @property url - The href of the link.
 * @property text - Display text for the link.
 */
export interface TimelineEventLink {
  url: string;
  text: string;
}

/**
 * Extended details for a timeline event.
 *
 * @property image - Optional image URL to display.
 * @property links - Optional array of related links.
 */
export interface TimelineEventDetails {
  image?: string;
  links?: TimelineEventLink[];
}

/**
 * A single event to display on the timeline.
 *
 * @property id - Unique identifier for the event.
 * @property date - Date string (or ISO date) for the event.
 * @property title - Display title for the event.
 * @property description - Short description text.
 * @property details - Extended details (image, links).
 * @property milestone - Whether this event is a milestone.
 * @property color - Optional custom color override.
 * @property group - Optional group identifier for filtering.
 */
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  details?: TimelineEventDetails;
  milestone?: boolean;
  color?: string;
  group?: string;
}

/**
 * A group definition used for filtering events.
 *
 * @property id - Unique identifier for the group.
 * @property name - Display name for the filter button.
 * @property color - Dot color for the filter button.
 */
export interface TimelineGroup {
  id: string;
  name: string;
  color: string;
}

/**
 * Color overrides for timeline visual elements.
 *
 * @property default - Default event dot color.
 * @property milestone - Milestone event dot color.
 * @property today - Today marker color.
 * @property connector - Connector line color.
 */
export interface TimelineColors {
  default?: string;
  milestone?: string;
  today?: string;
  connector?: string;
}

/**
 * Localizable label strings for the timeline component.
 *
 * @property today - Label for the today marker.
 * @property noEvents - Message when no events are displayed.
 * @property zoomIn - Tooltip for zoom in button.
 * @property zoomOut - Tooltip for zoom out button.
 * @property reset - Tooltip for reset zoom button.
 */
export interface TimelineLabels {
  today?: string;
  noEvents?: string;
  zoomIn?: string;
  zoomOut?: string;
  reset?: string;
}

/**
 * Configuration options for the {@link Timeline} constructor.
 * All properties are optional; sensible defaults are applied internally.
 */
export interface TimelineOptions {
  // Layout options
  orientation?: TimelineOrientation;
  layout?: TimelineLayout;

  // Data
  events?: TimelineEvent[];
  groups?: TimelineGroup[];

  // Display options
  showDates?: boolean;
  showConnectors?: boolean;
  showMilestones?: boolean;
  showFilters?: boolean;
  showZoom?: boolean;
  showToday?: boolean;

  // Interaction
  interactive?: boolean;
  expandable?: boolean;
  selectable?: boolean;
  draggable?: boolean;

  // Animation
  animated?: boolean;
  animationDuration?: number;
  staggerDelay?: number;

  // Date formatting
  dateFormat?: Intl.DateTimeFormatOptions;
  timeFormat?: Intl.DateTimeFormatOptions;

  // Colors
  colors?: TimelineColors;

  // Labels
  labels?: TimelineLabels;

  // Callbacks
  onEventClick?: ((event: TimelineEvent) => void) | null;
  onEventSelect?: ((event: TimelineEvent | undefined) => void) | null;
  onEventExpand?: ((event: TimelineEvent | undefined, isExpanded: boolean) => void) | null;
  onDateRangeChange?: ((range: DateRange) => void) | null;
  onFilter?: ((activeFilters: string[]) => void) | null;
}

/** Internal defaults merged with user-supplied options. */
interface ResolvedOptions {
  orientation: TimelineOrientation;
  layout: TimelineLayout;
  events: TimelineEvent[];
  groups: TimelineGroup[];
  showDates: boolean;
  showConnectors: boolean;
  showMilestones: boolean;
  showFilters: boolean;
  showZoom: boolean;
  showToday: boolean;
  interactive: boolean;
  expandable: boolean;
  selectable: boolean;
  draggable: boolean;
  animated: boolean;
  animationDuration: number;
  staggerDelay: number;
  dateFormat: Intl.DateTimeFormatOptions;
  timeFormat: Intl.DateTimeFormatOptions;
  colors: ResolvedTimelineColors;
  labels: ResolvedTimelineLabels;
  onEventClick: ((event: TimelineEvent) => void) | null;
  onEventSelect: ((event: TimelineEvent | undefined) => void) | null;
  onEventExpand: ((event: TimelineEvent | undefined, isExpanded: boolean) => void) | null;
  onDateRangeChange: ((range: DateRange) => void) | null;
  onFilter: ((activeFilters: string[]) => void) | null;
}

/** Fully resolved color values (no undefined). */
interface ResolvedTimelineColors {
  default: string;
  milestone: string;
  today: string;
  connector: string;
}

/** Fully resolved label strings (no undefined). */
interface ResolvedTimelineLabels {
  today: string;
  noEvents: string;
  zoomIn: string;
  zoomOut: string;
  reset: string;
}

/** A date range with start and end bounds. */
interface DateRange {
  start: Date;
  end: Date;
}

/** Internal state for the timeline component. */
interface TimelineState {
  events: TimelineEvent[];
  filteredEvents: TimelineEvent[];
  selectedEvent: string | null;
  expandedEvents: Set<string>;
  activeFilters: Set<string>;
  zoomLevel: number;
  panPosition: number;
  dateRange: DateRange | null;
  isAnimating: boolean;
}

/** Stored event handler entry for cleanup. */
interface HandlerEntry {
  element: HTMLElement | Document;
  type: string;
  handler: EventListener;
}

/** Events grouped by their date string key. */
type GroupedEvents = Record<string, TimelineEvent[]>;

/** Side placement for event elements. */
type EventSide = 'left' | 'right' | 'branch' | 'compact';

class Timeline {
  private element: HTMLElement;
  private options: ResolvedOptions;
  private state: TimelineState;

  // Resource tracking for cleanup
  private handlers: Map<string, HandlerEntry>;
  private timers: Set<ReturnType<typeof setTimeout>>;
  private createdElements: Set<HTMLElement>;
  private observers: Set<MutationObserver | IntersectionObserver | ResizeObserver>;
  private animations: Set<Animation>;

  // DOM references set during init() → setupDOM()
  private container!: HTMLDivElement;
  private controls?: HTMLDivElement;
  private wrapper!: HTMLDivElement;
  private track!: HTMLDivElement;
  private connector?: HTMLDivElement;
  private todayMarker?: HTMLDivElement;
  private eventsContainer!: HTMLDivElement;

  constructor(element: HTMLElement, options: TimelineOptions = {}) {
    this.element = element;
    this.options = {
      // Layout options
      orientation: options.orientation || 'vertical',
      layout: options.layout || 'default',

      // Data
      events: options.events || [],
      groups: options.groups || [],

      // Display options
      showDates: options.showDates !== false,
      showConnectors: options.showConnectors !== false,
      showMilestones: options.showMilestones !== false,
      showFilters: options.showFilters || false,
      showZoom: options.showZoom || false,
      showToday: options.showToday !== false,

      // Interaction
      interactive: options.interactive !== false,
      expandable: options.expandable !== false,
      selectable: options.selectable || false,
      draggable: options.draggable || false,

      // Animation
      animated: options.animated !== false,
      animationDuration: options.animationDuration || 400,
      staggerDelay: options.staggerDelay || 50,

      // Date formatting
      dateFormat: options.dateFormat || {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      timeFormat: options.timeFormat || {
        hour: '2-digit',
        minute: '2-digit',
      },

      // Colors
      colors: {
        default: options.colors?.default || 'var(--color-primary, #ed8b00)',
        milestone: options.colors?.milestone || 'var(--apple-success, #34c759)',
        today: options.colors?.today || 'var(--apple-info, #007aff)',
        connector: options.colors?.connector || 'var(--apple-gray-300, #e0e0e0)',
      },

      // Labels
      labels: {
        today: options.labels?.today || 'Today',
        noEvents: options.labels?.noEvents || 'No events to display',
        zoomIn: options.labels?.zoomIn || 'Zoom In',
        zoomOut: options.labels?.zoomOut || 'Zoom Out',
        reset: options.labels?.reset || 'Reset View',
      },

      // Callbacks
      onEventClick: options.onEventClick || null,
      onEventSelect: options.onEventSelect || null,
      onEventExpand: options.onEventExpand || null,
      onDateRangeChange: options.onDateRangeChange || null,
      onFilter: options.onFilter || null,
    };

    // State
    this.state = {
      events: [],
      filteredEvents: [],
      selectedEvent: null,
      expandedEvents: new Set(),
      activeFilters: new Set(),
      zoomLevel: 1,
      panPosition: 0,
      dateRange: null,
      isAnimating: false,
    };

    // Track resources for cleanup
    this.handlers = new Map();
    this.timers = new Set();
    this.createdElements = new Set();
    this.observers = new Set();
    this.animations = new Set();

    this.init();
  }

  /** Validate that a URL uses a safe protocol (not javascript:, data:, etc.) */
  private _isSafeURL(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.href);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  private init(): void {
    this.processEvents();
    this.setupDOM();
    this.attachEvents();
    this.render();

    if (this.options.animated) {
      this.animateIn();
    }
  }

  private processEvents(): void {
    // Sort events by date
    this.state.events = [...this.options.events].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Set initial filtered events
    this.state.filteredEvents = [...this.state.events];

    // Calculate date range
    if (this.state.events.length) {
      const dates = this.state.events.map((e) => new Date(e.date));
      this.state.dateRange = {
        start: new Date(Math.min(...dates.map((d) => d.getTime()))),
        end: new Date(Math.max(...dates.map((d) => d.getTime()))),
      };
    }
  }

  private setupDOM(): void {
    // Clear element
    this.element.innerHTML = '';

    // Add classes
    this.element.classList.add('aiab-timeline');
    this.element.classList.add(`aiab-timeline-${this.options.orientation}`);
    this.element.classList.add(`aiab-timeline-${this.options.layout}`);

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'aiab-timeline-container';

    // Create controls
    if (this.options.showFilters || this.options.showZoom) {
      this.controls = this.createControls();
      this.element.appendChild(this.controls);
    }

    // Create aiab-timeline wrapper for scroll/zoom
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'aiab-timeline-wrapper';

    // Create aiab-timeline track
    this.track = document.createElement('div');
    this.track.className = 'aiab-timeline-track';

    // Create connector line
    if (this.options.showConnectors) {
      this.connector = document.createElement('div');
      this.connector.className = 'aiab-timeline-connector';
      this.connector.style.background = this.options.colors.connector;
      this.track.appendChild(this.connector);
    }

    // Create today marker
    if (this.options.showToday && this.isDateInRange(new Date())) {
      this.todayMarker = this.createTodayMarker();
      this.track.appendChild(this.todayMarker);
    }

    // Create events container
    this.eventsContainer = document.createElement('div');
    this.eventsContainer.className = 'aiab-timeline-events';

    this.track.appendChild(this.eventsContainer);
    this.wrapper.appendChild(this.track);
    this.container.appendChild(this.wrapper);
    this.element.appendChild(this.container);

    // Store created elements
    this.createdElements.add(this.container);
    this.createdElements.add(this.wrapper);
    this.createdElements.add(this.track);
    this.createdElements.add(this.eventsContainer);
  }

  private createControls(): HTMLDivElement {
    const controls = document.createElement('div');
    controls.className = 'aiab-timeline-controls';

    // Filter controls
    if (this.options.showFilters && this.options.groups.length) {
      const filters = document.createElement('div');
      filters.className = 'aiab-timeline-filters';

      const filterLabel = document.createElement('span');
      filterLabel.className = 'aiab-filter-label';
      filterLabel.textContent = 'Filter: ';
      filters.appendChild(filterLabel);

      this.options.groups.forEach((group) => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'aiab-filter-btn';
        filterBtn.dataset.group = group.id;
        filterBtn.innerHTML = `
          <span class="filter-dot" style="background: ${group.color}"></span>
          <span class="filter-text">${group.name}</span>
        `;
        filters.appendChild(filterBtn);
      });

      controls.appendChild(filters);
    }

    // Zoom controls
    if (this.options.showZoom) {
      const zoomControls = document.createElement('div');
      zoomControls.className = 'aiab-timeline-zoom';

      const zoomOut = document.createElement('button');
      zoomOut.className = 'aiab-zoom-btn zoom-out';
      zoomOut.title = this.options.labels.zoomOut;
      zoomOut.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35M8 11h6"/>
      </svg>`;

      const zoomIn = document.createElement('button');
      zoomIn.className = 'aiab-zoom-btn zoom-in';
      zoomIn.title = this.options.labels.zoomIn;
      zoomIn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
      </svg>`;

      const reset = document.createElement('button');
      reset.className = 'aiab-zoom-btn zoom-reset';
      reset.title = this.options.labels.reset;
      reset.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M1 1l22 22M9 9v6h6"/>
      </svg>`;

      zoomControls.appendChild(zoomOut);
      zoomControls.appendChild(zoomIn);
      zoomControls.appendChild(reset);

      controls.appendChild(zoomControls);
    }

    this.createdElements.add(controls);
    return controls;
  }

  private createTodayMarker(): HTMLDivElement {
    const marker = document.createElement('div');
    marker.className = 'aiab-timeline-today';

    const line = document.createElement('div');
    line.className = 'aiab-today-line';
    line.style.background = this.options.colors.today;

    const label = document.createElement('div');
    label.className = 'aiab-today-label';
    label.textContent = this.options.labels.today;
    label.style.background = this.options.colors.today;

    marker.appendChild(line);
    marker.appendChild(label);

    // Position today marker
    const position = this.getPositionForDate(new Date());
    if (this.options.orientation === 'horizontal') {
      marker.style.left = `${position}%`;
    } else {
      marker.style.top = `${position}%`;
    }

    this.createdElements.add(marker);
    return marker;
  }

  private render(): void {
    // Clear events container
    this.eventsContainer.innerHTML = '';

    if (!this.state.filteredEvents.length) {
      this.renderEmptyState();
      return;
    }

    // Group events by date if needed
    const eventsByDate = this.groupEventsByDate(this.state.filteredEvents);

    // Render based on layout
    switch (this.options.layout) {
      case 'centered':
        this.renderCenteredLayout(eventsByDate);
        break;
      case 'branching':
        this.renderBranchingLayout(eventsByDate);
        break;
      case 'compact':
        this.renderCompactLayout(eventsByDate);
        break;
      default:
        this.renderDefaultLayout(eventsByDate);
    }
  }

  private renderDefaultLayout(eventsByDate: GroupedEvents): void {
    let side: EventSide = 'left';

    Object.entries(eventsByDate).forEach(([date, events]) => {
      const group = document.createElement('div');
      group.className = 'aiab-timeline-group';

      // Date marker
      if (this.options.showDates) {
        const dateMarker = document.createElement('div');
        dateMarker.className = 'aiab-timeline-date';
        dateMarker.textContent = this.formatDate(date);
        group.appendChild(dateMarker);
      }

      // Events for this date
      events.forEach((event) => {
        const eventEl = this.createEventElement(event, side);
        group.appendChild(eventEl);

        // Alternate sides for vertical layout
        if (this.options.orientation === 'vertical' && this.options.layout === 'default') {
          side = side === 'left' ? 'right' : 'left';
        }
      });

      // Position group
      const position = this.getPositionForDate(date);
      if (this.options.orientation === 'horizontal') {
        group.style.left = `${position}%`;
      } else {
        group.style.top = `${position}%`;
      }

      this.eventsContainer.appendChild(group);
    });
  }

  private renderCenteredLayout(eventsByDate: GroupedEvents): void {
    let index = 0;

    Object.entries(eventsByDate).forEach(([date, events]) => {
      const group = document.createElement('div');
      group.className = 'aiab-timeline-group centered';

      events.forEach((event) => {
        const side: EventSide = index % 2 === 0 ? 'left' : 'right';
        const eventEl = this.createEventElement(event, side);
        group.appendChild(eventEl);
        index++;
      });

      const position = this.getPositionForDate(date);
      if (this.options.orientation === 'horizontal') {
        group.style.left = `${position}%`;
      } else {
        group.style.top = `${position}%`;
      }

      this.eventsContainer.appendChild(group);
    });
  }

  private renderBranchingLayout(eventsByDate: GroupedEvents): void {
    Object.entries(eventsByDate).forEach(([date, events]) => {
      const branch = document.createElement('div');
      branch.className = 'aiab-timeline-branch';

      // Main node
      const node = document.createElement('div');
      node.className = 'aiab-branch-node';

      const nodeDate = document.createElement('div');
      nodeDate.className = 'aiab-node-date';
      nodeDate.textContent = this.formatDate(date);
      node.appendChild(nodeDate);

      // Branch events
      const branchEvents = document.createElement('div');
      branchEvents.className = 'aiab-branch-events';

      events.forEach((event) => {
        const eventEl = this.createEventElement(event, 'branch');
        branchEvents.appendChild(eventEl);
      });

      branch.appendChild(node);
      branch.appendChild(branchEvents);

      const position = this.getPositionForDate(date);
      if (this.options.orientation === 'horizontal') {
        branch.style.left = `${position}%`;
      } else {
        branch.style.top = `${position}%`;
      }

      this.eventsContainer.appendChild(branch);
    });
  }

  private renderCompactLayout(eventsByDate: GroupedEvents): void {
    const list = document.createElement('div');
    list.className = 'aiab-timeline-list compact';

    Object.entries(eventsByDate).forEach(([_date, events]) => {
      events.forEach((event) => {
        const eventEl = this.createEventElement(event, 'compact');
        list.appendChild(eventEl);
      });
    });

    this.eventsContainer.appendChild(list);
  }

  private createEventElement(event: TimelineEvent, side: EventSide): HTMLDivElement {
    const eventEl = document.createElement('div');
    eventEl.className = `aiab-timeline-event ${side}`;
    eventEl.dataset.eventId = event.id;

    if (event.milestone) {
      eventEl.classList.add('milestone');
    }

    if (this.state.selectedEvent === event.id) {
      eventEl.classList.add('selected');
    }

    if (this.state.expandedEvents.has(event.id)) {
      eventEl.classList.add('expanded');
    }

    // Event dot
    const dot = document.createElement('div');
    dot.className = 'aiab-event-dot';
    const dotColor = event.milestone
      ? this.options.colors.milestone
      : event.color || this.getGroupColor(event.group) || this.options.colors.default;
    dot.style.background = dotColor;

    // Event content
    const content = document.createElement('div');
    content.className = 'aiab-event-content';

    // Event header
    const header = document.createElement('div');
    header.className = 'aiab-event-header';

    const title = document.createElement('h4');
    title.className = 'aiab-event-title';
    title.textContent = event.title;

    const time = document.createElement('span');
    time.className = 'aiab-event-time';
    time.textContent = this.formatTime(event.date);

    header.appendChild(title);
    header.appendChild(time);

    // Event body (expandable)
    if (event.description || event.details) {
      const body = document.createElement('div');
      body.className = 'aiab-event-body';

      if (event.description) {
        const desc = document.createElement('p');
        desc.className = 'aiab-event-description';
        desc.textContent = event.description;
        body.appendChild(desc);
      }

      if (event.details) {
        const details = document.createElement('div');
        details.className = 'aiab-event-details';

        if (event.details.image) {
          const img = document.createElement('img');
          // Validate image URL — only allow http(s) protocols
          if (this._isSafeURL(event.details.image)) {
            img.src = event.details.image;
          }
          img.alt = event.title;
          details.appendChild(img);
        }

        if (event.details.links) {
          const links = document.createElement('div');
          links.className = 'aiab-event-links';

          event.details.links.forEach((link) => {
            const a = document.createElement('a');
            // Validate link URL — block javascript: protocol
            if (this._isSafeURL(link.url)) {
              a.href = link.url;
            }
            a.textContent = link.text;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            links.appendChild(a);
          });

          details.appendChild(links);
        }

        body.appendChild(details);
      }

      content.appendChild(body);
    }

    // Event actions
    if (this.options.interactive) {
      const actions = document.createElement('div');
      actions.className = 'aiab-event-actions';

      if (this.options.expandable && (event.description || event.details)) {
        const expandBtn = document.createElement('button');
        expandBtn.className = 'aiab-expand-btn';
        expandBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 9l6 6 6-6"/>
        </svg>`;
        actions.appendChild(expandBtn);
      }

      content.appendChild(actions);
    }

    content.insertBefore(header, content.firstChild);
    eventEl.appendChild(dot);
    eventEl.appendChild(content);

    // Store element reference
    this.createdElements.add(eventEl);

    return eventEl;
  }

  private renderEmptyState(): void {
    const empty = document.createElement('div');
    empty.className = 'aiab-timeline-empty';
    empty.textContent = this.options.labels.noEvents;
    this.eventsContainer.appendChild(empty);
  }

  private attachEvents(): void {
    // Event clicks
    const eventHandler: EventListener = (e: Event) => {
      const target = e.target as HTMLElement;
      const eventEl = target.closest('.aiab-timeline-event') as HTMLElement | null;
      if (!eventEl) return;

      const eventId = eventEl.dataset.eventId;
      const timelineEvent = this.state.events.find((ev) => ev.id === eventId);

      if (target.closest('.aiab-expand-btn')) {
        if (eventId) {
          this.toggleExpand(eventId);
        }
      } else {
        this.handleEventClick(timelineEvent);
      }
    };

    this.eventsContainer.addEventListener('click', eventHandler);
    this.handlers.set('events', {
      element: this.eventsContainer,
      type: 'click',
      handler: eventHandler,
    });

    // Filter buttons
    if (this.options.showFilters) {
      const filterBtns = this.element.querySelectorAll<HTMLButtonElement>('.aiab-filter-btn');
      filterBtns.forEach((btn, index) => {
        const filterHandler: EventListener = () => {
          if (btn.dataset.group) {
            this.toggleFilter(btn.dataset.group);
          }
        };
        btn.addEventListener('click', filterHandler);
        this.handlers.set(`filter-${index}`, {
          element: btn,
          type: 'click',
          handler: filterHandler,
        });
      });
    }

    // Zoom controls
    if (this.options.showZoom) {
      const zoomInBtn = this.element.querySelector<HTMLButtonElement>('.zoom-in');
      const zoomOutBtn = this.element.querySelector<HTMLButtonElement>('.zoom-out');
      const resetBtn = this.element.querySelector<HTMLButtonElement>('.zoom-reset');

      if (zoomInBtn) {
        const zoomInHandler: EventListener = () => this.zoomIn();
        zoomInBtn.addEventListener('click', zoomInHandler);
        this.handlers.set('zoom-in', { element: zoomInBtn, type: 'click', handler: zoomInHandler });
      }

      if (zoomOutBtn) {
        const zoomOutHandler: EventListener = () => this.zoomOut();
        zoomOutBtn.addEventListener('click', zoomOutHandler);
        this.handlers.set('zoom-out', {
          element: zoomOutBtn,
          type: 'click',
          handler: zoomOutHandler,
        });
      }

      if (resetBtn) {
        const resetHandler: EventListener = () => this.resetZoom();
        resetBtn.addEventListener('click', resetHandler);
        this.handlers.set('zoom-reset', {
          element: resetBtn,
          type: 'click',
          handler: resetHandler,
        });
      }
    }

    // Keyboard navigation
    const keyHandler: EventListener = (e: Event) => this.handleKeyboard(e as KeyboardEvent);
    this.element.addEventListener('keydown', keyHandler);
    this.handlers.set('keyboard', { element: this.element, type: 'keydown', handler: keyHandler });

    // Touch/mouse pan for horizontal timelines
    if (this.options.orientation === 'horizontal' && this.options.showZoom) {
      this.attachPanEvents();
    }
  }

  private attachPanEvents(): void {
    let startX = 0;
    let currentX = 0;
    let startScroll = 0;
    let isPanning = false;

    const startHandler: EventListener = (e: Event) => {
      isPanning = true;
      startX = e.type.includes('mouse')
        ? (e as MouseEvent).clientX
        : (e as TouchEvent).touches[0].clientX;
      startScroll = this.wrapper.scrollLeft;
      this.wrapper.style.cursor = 'grabbing';
    };

    const moveHandler: EventListener = (e: Event) => {
      if (!isPanning) return;
      e.preventDefault();

      currentX = e.type.includes('mouse')
        ? (e as MouseEvent).clientX
        : (e as TouchEvent).touches[0].clientX;
      const diff = startX - currentX;
      this.wrapper.scrollLeft = startScroll + diff;
    };

    const endHandler: EventListener = () => {
      isPanning = false;
      this.wrapper.style.cursor = 'grab';
    };

    this.wrapper.style.cursor = 'grab';

    this.wrapper.addEventListener('mousedown', startHandler);
    this.wrapper.addEventListener('touchstart', startHandler);
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('mouseup', endHandler);
    document.addEventListener('touchend', endHandler);

    this.handlers.set('pan-start-mouse', {
      element: this.wrapper,
      type: 'mousedown',
      handler: startHandler,
    });
    this.handlers.set('pan-start-touch', {
      element: this.wrapper,
      type: 'touchstart',
      handler: startHandler,
    });
    this.handlers.set('pan-move-mouse', {
      element: document,
      type: 'mousemove',
      handler: moveHandler,
    });
    this.handlers.set('pan-move-touch', {
      element: document,
      type: 'touchmove',
      handler: moveHandler,
    });
    this.handlers.set('pan-end-mouse', { element: document, type: 'mouseup', handler: endHandler });
    this.handlers.set('pan-end-touch', {
      element: document,
      type: 'touchend',
      handler: endHandler,
    });
  }

  private handleEventClick(event: TimelineEvent | undefined): void {
    if (!this.options.interactive || !event) return;

    // Select event
    if (this.options.selectable) {
      this.selectEvent(event.id);
    }

    // Trigger callback
    if (this.options.onEventClick) {
      this.options.onEventClick(event);
    }
  }

  selectEvent(eventId: string): void {
    this.state.selectedEvent = eventId;

    // Update UI
    this.element.querySelectorAll<HTMLElement>('.aiab-timeline-event').forEach((el) => {
      el.classList.toggle('selected', el.dataset.eventId === eventId);
    });

    // Trigger callback
    if (this.options.onEventSelect) {
      const event = this.state.events.find((e) => e.id === eventId);
      this.options.onEventSelect(event);
    }
  }

  toggleExpand(eventId: string): void {
    if (this.state.expandedEvents.has(eventId)) {
      this.state.expandedEvents.delete(eventId);
    } else {
      this.state.expandedEvents.add(eventId);
    }

    const eventEl = this.element.querySelector<HTMLElement>(`[data-event-id="${eventId}"]`);
    if (eventEl) {
      eventEl.classList.toggle('expanded');

      // Animate expansion
      const body = eventEl.querySelector<HTMLElement>('.aiab-event-body');
      if (body) {
        if (eventEl.classList.contains('expanded')) {
          body.style.maxHeight = `${body.scrollHeight}px`;
        } else {
          body.style.maxHeight = '0';
        }
      }
    }

    // Trigger callback
    if (this.options.onEventExpand) {
      const event = this.state.events.find((e) => e.id === eventId);
      const isExpanded = this.state.expandedEvents.has(eventId);
      this.options.onEventExpand(event, isExpanded);
    }
  }

  toggleFilter(groupId: string): void {
    const btn = this.element.querySelector<HTMLElement>(`[data-group="${groupId}"]`);

    if (this.state.activeFilters.has(groupId)) {
      this.state.activeFilters.delete(groupId);
      btn?.classList.remove('active');
    } else {
      this.state.activeFilters.add(groupId);
      btn?.classList.add('active');
    }

    this.applyFilters();
  }

  private applyFilters(): void {
    if (this.state.activeFilters.size === 0) {
      this.state.filteredEvents = [...this.state.events];
    } else {
      this.state.filteredEvents = this.state.events.filter((event) => {
        return event.group ? this.state.activeFilters.has(event.group) : false;
      });
    }

    this.render();

    if (this.options.animated) {
      this.animateIn();
    }

    // Trigger callback
    if (this.options.onFilter) {
      this.options.onFilter(Array.from(this.state.activeFilters));
    }
  }

  zoomIn(): void {
    this.state.zoomLevel = Math.min(3, this.state.zoomLevel * 1.2);
    this.applyZoom();
  }

  zoomOut(): void {
    this.state.zoomLevel = Math.max(0.5, this.state.zoomLevel / 1.2);
    this.applyZoom();
  }

  resetZoom(): void {
    this.state.zoomLevel = 1;
    this.state.panPosition = 0;
    this.applyZoom();
  }

  private applyZoom(): void {
    const scale = this.state.zoomLevel;

    if (this.options.orientation === 'horizontal') {
      this.track.style.transform = `scaleX(${scale})`;
      this.track.style.transformOrigin = 'left center';
    } else {
      this.track.style.transform = `scaleY(${scale})`;
      this.track.style.transformOrigin = 'center top';
    }
  }

  private handleKeyboard(e: KeyboardEvent): void {
    const selectedEl = this.element.querySelector<HTMLElement>('.aiab-timeline-event.selected');
    if (!selectedEl) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        this.navigateEvents('prev');
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        this.navigateEvents('next');
        break;

      case 'Enter':
      case ' ': {
        e.preventDefault();
        const eventId = selectedEl.dataset.eventId;
        if (this.options.expandable && eventId) {
          this.toggleExpand(eventId);
        }
        break;
      }
    }
  }

  private navigateEvents(direction: 'prev' | 'next'): void {
    const events = Array.from(this.element.querySelectorAll<HTMLElement>('.aiab-timeline-event'));
    const currentIndex = events.findIndex((el) => el.classList.contains('selected'));

    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = currentIndex < events.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : events.length - 1;
    }

    const nextEvent = events[nextIndex];
    if (nextEvent?.dataset.eventId) {
      this.selectEvent(nextEvent.dataset.eventId);
      nextEvent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  private animateIn(): void {
    if (this.state.isAnimating) return;
    this.state.isAnimating = true;

    const events = this.element.querySelectorAll<HTMLElement>('.aiab-timeline-event');

    events.forEach((event, index) => {
      event.style.opacity = '0';
      event.style.transform =
        this.options.orientation === 'horizontal' ? 'translateX(-20px)' : 'translateY(-20px)';

      const timer = setTimeout(() => {
        event.style.transition = `all ${this.options.animationDuration}ms var(--ease-apple-bounce)`;
        event.style.opacity = '1';
        event.style.transform = 'translate(0, 0)';
      }, index * this.options.staggerDelay);

      this.timers.add(timer);
    });

    const completeTimer = setTimeout(
      () => {
        this.state.isAnimating = false;
      },
      events.length * this.options.staggerDelay + this.options.animationDuration,
    );

    this.timers.add(completeTimer);
  }

  // Helper methods
  private groupEventsByDate(events: TimelineEvent[]): GroupedEvents {
    const grouped: GroupedEvents = {};

    events.forEach((event) => {
      const date = new Date(event.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });

    return grouped;
  }

  private getPositionForDate(date: Date | string): number {
    if (!this.state.dateRange) return 50;

    const dateObj = new Date(date);
    const start = this.state.dateRange.start.getTime();
    const end = this.state.dateRange.end.getTime();
    const current = dateObj.getTime();

    const position = ((current - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, position));
  }

  private isDateInRange(date: Date): boolean {
    if (!this.state.dateRange) return false;

    const time = date.getTime();
    return (
      time >= this.state.dateRange.start.getTime() && time <= this.state.dateRange.end.getTime()
    );
  }

  private formatDate(date: Date | string): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(undefined, this.options.dateFormat);
  }

  private formatTime(date: Date | string): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString(undefined, this.options.timeFormat);
  }

  private getGroupColor(groupId: string | undefined): string | null {
    if (!groupId) return null;
    const group = this.options.groups.find((g) => g.id === groupId);
    return group?.color || null;
  }

  // Public API
  addEvent(event: TimelineEvent): void {
    this.state.events.push(event);
    this.processEvents();
    this.render();

    if (this.options.animated) {
      this.animateIn();
    }
  }

  removeEvent(eventId: string): void {
    this.state.events = this.state.events.filter((e) => e.id !== eventId);
    this.processEvents();
    this.render();
  }

  updateEvent(eventId: string, updates: Partial<TimelineEvent>): void {
    const event = this.state.events.find((e) => e.id === eventId);
    if (event) {
      Object.assign(event, updates);
      this.processEvents();
      this.render();
    }
  }

  setDateRange(startDate: Date | string, endDate: Date | string): void {
    this.state.dateRange = {
      start: new Date(startDate),
      end: new Date(endDate),
    };
    this.render();
  }

  scrollToEvent(eventId: string): void {
    const eventEl = this.element.querySelector<HTMLElement>(`[data-event-id="${eventId}"]`);
    if (eventEl) {
      eventEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  scrollToDate(date: Date | string): void {
    const position = this.getPositionForDate(date);

    if (this.options.orientation === 'horizontal') {
      const scrollPosition = (this.wrapper.scrollWidth * position) / 100;
      this.wrapper.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    } else {
      const scrollPosition = (this.wrapper.scrollHeight * position) / 100;
      this.wrapper.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
  }

  destroy(): void {
    // Clear timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // Remove event listeners
    this.handlers.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.handlers.clear();

    // Disconnect observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Clear animations
    this.animations.forEach((animation) => animation.cancel());
    this.animations.clear();

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

// Extend Window interface for global assignments
declare global {
  interface Window {
    Timeline: typeof Timeline;
  }
}

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    document.querySelectorAll<HTMLElement>('[data-timeline]').forEach((element) => {
      new Timeline(element);
    });
  } catch (error) {
    console.error('[Amphibious] Timeline auto-init failed:', error);
  }
});

// Register with component registry if available
if (window.AmphibiousRegistry) {
  // biome-ignore lint/suspicious/noExplicitAny: constructor type variance for registry
  window.AmphibiousRegistry.registerComponent('aiab-timeline', Timeline as any);
}

// Export
window.Timeline = Timeline;
export default Timeline;
export { Timeline };
