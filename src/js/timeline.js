/**
 * Timeline Component
 * Interactive timeline for displaying chronological events
 * Part of Amphibious 2.0 Component Library
 *
 * Features:
 * - Horizontal and vertical layouts
 * - Multiple timeline styles (default, centered, branching)
 * - Interactive events with details
 * - Filtering and grouping
 * - Zoom and pan controls
 * - Animated transitions
 * - Milestone markers
 * - Date range selection
 */

class Timeline {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      // Layout options
      orientation: options.orientation || 'vertical', // vertical, horizontal
      layout: options.layout || 'default', // default, centered, branching, compact

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
      colors: options.colors || {
        default: 'var(--apple-orange-500, #ed8b00)',
        milestone: 'var(--apple-success, #34c759)',
        today: 'var(--apple-info, #007aff)',
        connector: 'var(--apple-gray-300, #e0e0e0)',
      },

      // Labels
      labels: {
        today: options.labels?.today || 'Today',
        noEvents: options.labels?.noEvents || 'No events to display',
        zoomIn: options.labels?.zoomIn || 'Zoom In',
        zoomOut: options.labels?.zoomOut || 'Zoom Out',
        reset: options.labels?.reset || 'Reset View',
        ...options.labels,
      },

      // Callbacks
      onEventClick: options.onEventClick || null,
      onEventSelect: options.onEventSelect || null,
      onEventExpand: options.onEventExpand || null,
      onDateRangeChange: options.onDateRangeChange || null,
      onFilter: options.onFilter || null,

      ...options,
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

  init() {
    this.processEvents();
    this.setupDOM();
    this.attachEvents();
    this.render();

    if (this.options.animated) {
      this.animateIn();
    }
  }

  processEvents() {
    // Sort events by date
    this.state.events = [...this.options.events].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    // Set initial filtered events
    this.state.filteredEvents = [...this.state.events];

    // Calculate date range
    if (this.state.events.length) {
      const dates = this.state.events.map((e) => new Date(e.date));
      this.state.dateRange = {
        start: new Date(Math.min(...dates)),
        end: new Date(Math.max(...dates)),
      };
    }
  }

  setupDOM() {
    // Clear element
    this.element.innerHTML = '';

    // Add classes
    this.element.classList.add('timeline');
    this.element.classList.add(`timeline-${this.options.orientation}`);
    this.element.classList.add(`timeline-${this.options.layout}`);

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'timeline-container';

    // Create controls
    if (this.options.showFilters || this.options.showZoom) {
      this.controls = this.createControls();
      this.element.appendChild(this.controls);
    }

    // Create timeline wrapper for scroll/zoom
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'timeline-wrapper';

    // Create timeline track
    this.track = document.createElement('div');
    this.track.className = 'timeline-track';

    // Create connector line
    if (this.options.showConnectors) {
      this.connector = document.createElement('div');
      this.connector.className = 'timeline-connector';
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
    this.eventsContainer.className = 'timeline-events';

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

  createControls() {
    const controls = document.createElement('div');
    controls.className = 'timeline-controls';

    // Filter controls
    if (this.options.showFilters && this.options.groups.length) {
      const filters = document.createElement('div');
      filters.className = 'timeline-filters';

      const filterLabel = document.createElement('span');
      filterLabel.className = 'filter-label';
      filterLabel.textContent = 'Filter: ';
      filters.appendChild(filterLabel);

      this.options.groups.forEach((group) => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
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
      zoomControls.className = 'timeline-zoom';

      const zoomOut = document.createElement('button');
      zoomOut.className = 'zoom-btn zoom-out';
      zoomOut.title = this.options.labels.zoomOut;
      zoomOut.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35M8 11h6"/>
      </svg>`;

      const zoomIn = document.createElement('button');
      zoomIn.className = 'zoom-btn zoom-in';
      zoomIn.title = this.options.labels.zoomIn;
      zoomIn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
      </svg>`;

      const reset = document.createElement('button');
      reset.className = 'zoom-btn zoom-reset';
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

  createTodayMarker() {
    const marker = document.createElement('div');
    marker.className = 'timeline-today';

    const line = document.createElement('div');
    line.className = 'today-line';
    line.style.background = this.options.colors.today;

    const label = document.createElement('div');
    label.className = 'today-label';
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

  render() {
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

  renderDefaultLayout(eventsByDate) {
    let side = 'left';

    Object.entries(eventsByDate).forEach(([date, events]) => {
      const group = document.createElement('div');
      group.className = 'timeline-group';

      // Date marker
      if (this.options.showDates) {
        const dateMarker = document.createElement('div');
        dateMarker.className = 'timeline-date';
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

  renderCenteredLayout(eventsByDate) {
    let index = 0;

    Object.entries(eventsByDate).forEach(([date, events]) => {
      const group = document.createElement('div');
      group.className = 'timeline-group centered';

      events.forEach((event) => {
        const side = index % 2 === 0 ? 'left' : 'right';
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

  renderBranchingLayout(eventsByDate) {
    Object.entries(eventsByDate).forEach(([date, events]) => {
      const branch = document.createElement('div');
      branch.className = 'timeline-branch';

      // Main node
      const node = document.createElement('div');
      node.className = 'branch-node';

      const nodeDate = document.createElement('div');
      nodeDate.className = 'node-date';
      nodeDate.textContent = this.formatDate(date);
      node.appendChild(nodeDate);

      // Branch events
      const branchEvents = document.createElement('div');
      branchEvents.className = 'branch-events';

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

  renderCompactLayout(eventsByDate) {
    const list = document.createElement('div');
    list.className = 'timeline-list compact';

    Object.entries(eventsByDate).forEach(([date, events]) => {
      events.forEach((event) => {
        const eventEl = this.createEventElement(event, 'compact');
        list.appendChild(eventEl);
      });
    });

    this.eventsContainer.appendChild(list);
  }

  createEventElement(event, side) {
    const eventEl = document.createElement('div');
    eventEl.className = `timeline-event ${side}`;
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
    dot.className = 'event-dot';
    const dotColor = event.milestone
      ? this.options.colors.milestone
      : event.color || this.getGroupColor(event.group) || this.options.colors.default;
    dot.style.background = dotColor;

    // Event content
    const content = document.createElement('div');
    content.className = 'event-content';

    // Event header
    const header = document.createElement('div');
    header.className = 'event-header';

    const title = document.createElement('h4');
    title.className = 'event-title';
    title.textContent = event.title;

    const time = document.createElement('span');
    time.className = 'event-time';
    time.textContent = this.formatTime(event.date);

    header.appendChild(title);
    header.appendChild(time);

    // Event body (expandable)
    if (event.description || event.details) {
      const body = document.createElement('div');
      body.className = 'event-body';

      if (event.description) {
        const desc = document.createElement('p');
        desc.className = 'event-description';
        desc.textContent = event.description;
        body.appendChild(desc);
      }

      if (event.details) {
        const details = document.createElement('div');
        details.className = 'event-details';

        if (event.details.image) {
          const img = document.createElement('img');
          img.src = event.details.image;
          img.alt = event.title;
          details.appendChild(img);
        }

        if (event.details.links) {
          const links = document.createElement('div');
          links.className = 'event-links';

          event.details.links.forEach((link) => {
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.text;
            a.target = '_blank';
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
      actions.className = 'event-actions';

      if (this.options.expandable && (event.description || event.details)) {
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-btn';
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

  renderEmptyState() {
    const empty = document.createElement('div');
    empty.className = 'timeline-empty';
    empty.textContent = this.options.labels.noEvents;
    this.eventsContainer.appendChild(empty);
  }

  attachEvents() {
    // Event clicks
    const eventHandler = (e) => {
      const eventEl = e.target.closest('.timeline-event');
      if (!eventEl) return;

      const eventId = eventEl.dataset.eventId;
      const event = this.state.events.find((e) => e.id === eventId);

      if (e.target.closest('.expand-btn')) {
        this.toggleExpand(eventId);
      } else {
        this.handleEventClick(event);
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
      const filterBtns = this.element.querySelectorAll('.filter-btn');
      filterBtns.forEach((btn, index) => {
        const filterHandler = () => this.toggleFilter(btn.dataset.group);
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
      const zoomInBtn = this.element.querySelector('.zoom-in');
      const zoomOutBtn = this.element.querySelector('.zoom-out');
      const resetBtn = this.element.querySelector('.zoom-reset');

      if (zoomInBtn) {
        const zoomInHandler = () => this.zoomIn();
        zoomInBtn.addEventListener('click', zoomInHandler);
        this.handlers.set('zoom-in', { element: zoomInBtn, type: 'click', handler: zoomInHandler });
      }

      if (zoomOutBtn) {
        const zoomOutHandler = () => this.zoomOut();
        zoomOutBtn.addEventListener('click', zoomOutHandler);
        this.handlers.set('zoom-out', {
          element: zoomOutBtn,
          type: 'click',
          handler: zoomOutHandler,
        });
      }

      if (resetBtn) {
        const resetHandler = () => this.resetZoom();
        resetBtn.addEventListener('click', resetHandler);
        this.handlers.set('zoom-reset', {
          element: resetBtn,
          type: 'click',
          handler: resetHandler,
        });
      }
    }

    // Keyboard navigation
    const keyHandler = (e) => this.handleKeyboard(e);
    this.element.addEventListener('keydown', keyHandler);
    this.handlers.set('keyboard', { element: this.element, type: 'keydown', handler: keyHandler });

    // Touch/mouse pan for horizontal timelines
    if (this.options.orientation === 'horizontal' && this.options.showZoom) {
      this.attachPanEvents();
    }
  }

  attachPanEvents() {
    let startX = 0;
    let currentX = 0;
    let startScroll = 0;
    let isPanning = false;

    const startHandler = (e) => {
      isPanning = true;
      startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      startScroll = this.wrapper.scrollLeft;
      this.wrapper.style.cursor = 'grabbing';
    };

    const moveHandler = (e) => {
      if (!isPanning) return;
      e.preventDefault();

      currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const diff = startX - currentX;
      this.wrapper.scrollLeft = startScroll + diff;
    };

    const endHandler = () => {
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

  handleEventClick(event) {
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

  selectEvent(eventId) {
    this.state.selectedEvent = eventId;

    // Update UI
    this.element.querySelectorAll('.timeline-event').forEach((el) => {
      el.classList.toggle('selected', el.dataset.eventId === eventId);
    });

    // Trigger callback
    if (this.options.onEventSelect) {
      const event = this.state.events.find((e) => e.id === eventId);
      this.options.onEventSelect(event);
    }
  }

  toggleExpand(eventId) {
    if (this.state.expandedEvents.has(eventId)) {
      this.state.expandedEvents.delete(eventId);
    } else {
      this.state.expandedEvents.add(eventId);
    }

    const eventEl = this.element.querySelector(`[data-event-id="${eventId}"]`);
    if (eventEl) {
      eventEl.classList.toggle('expanded');

      // Animate expansion
      const body = eventEl.querySelector('.event-body');
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

  toggleFilter(groupId) {
    const btn = this.element.querySelector(`[data-group="${groupId}"]`);

    if (this.state.activeFilters.has(groupId)) {
      this.state.activeFilters.delete(groupId);
      btn.classList.remove('active');
    } else {
      this.state.activeFilters.add(groupId);
      btn.classList.add('active');
    }

    this.applyFilters();
  }

  applyFilters() {
    if (this.state.activeFilters.size === 0) {
      this.state.filteredEvents = [...this.state.events];
    } else {
      this.state.filteredEvents = this.state.events.filter((event) => {
        return this.state.activeFilters.has(event.group);
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

  zoomIn() {
    this.state.zoomLevel = Math.min(3, this.state.zoomLevel * 1.2);
    this.applyZoom();
  }

  zoomOut() {
    this.state.zoomLevel = Math.max(0.5, this.state.zoomLevel / 1.2);
    this.applyZoom();
  }

  resetZoom() {
    this.state.zoomLevel = 1;
    this.state.panPosition = 0;
    this.applyZoom();
  }

  applyZoom() {
    const scale = this.state.zoomLevel;

    if (this.options.orientation === 'horizontal') {
      this.track.style.transform = `scaleX(${scale})`;
      this.track.style.transformOrigin = 'left center';
    } else {
      this.track.style.transform = `scaleY(${scale})`;
      this.track.style.transformOrigin = 'center top';
    }
  }

  handleKeyboard(e) {
    const selectedEl = this.element.querySelector('.timeline-event.selected');
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
        if (this.options.expandable) {
          this.toggleExpand(eventId);
        }
        break;
      }
    }
  }

  navigateEvents(direction) {
    const events = Array.from(this.element.querySelectorAll('.timeline-event'));
    const currentIndex = events.findIndex((el) => el.classList.contains('selected'));

    let nextIndex;
    if (direction === 'next') {
      nextIndex = currentIndex < events.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : events.length - 1;
    }

    const nextEvent = events[nextIndex];
    if (nextEvent) {
      this.selectEvent(nextEvent.dataset.eventId);
      nextEvent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  animateIn() {
    if (this.state.isAnimating) return;
    this.state.isAnimating = true;

    const events = this.element.querySelectorAll('.timeline-event');

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
  groupEventsByDate(events) {
    const grouped = {};

    events.forEach((event) => {
      const date = new Date(event.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });

    return grouped;
  }

  getPositionForDate(date) {
    if (!this.state.dateRange) return 50;

    const dateObj = new Date(date);
    const start = this.state.dateRange.start.getTime();
    const end = this.state.dateRange.end.getTime();
    const current = dateObj.getTime();

    const position = ((current - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, position));
  }

  isDateInRange(date) {
    if (!this.state.dateRange) return false;

    const time = date.getTime();
    return (
      time >= this.state.dateRange.start.getTime() && time <= this.state.dateRange.end.getTime()
    );
  }

  formatDate(date) {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(undefined, this.options.dateFormat);
  }

  formatTime(date) {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString(undefined, this.options.timeFormat);
  }

  getGroupColor(groupId) {
    const group = this.options.groups.find((g) => g.id === groupId);
    return group?.color || null;
  }

  // Public API
  addEvent(event) {
    this.state.events.push(event);
    this.processEvents();
    this.render();

    if (this.options.animated) {
      this.animateIn();
    }
  }

  removeEvent(eventId) {
    this.state.events = this.state.events.filter((e) => e.id !== eventId);
    this.processEvents();
    this.render();
  }

  updateEvent(eventId, updates) {
    const event = this.state.events.find((e) => e.id === eventId);
    if (event) {
      Object.assign(event, updates);
      this.processEvents();
      this.render();
    }
  }

  setDateRange(startDate, endDate) {
    this.state.dateRange = {
      start: new Date(startDate),
      end: new Date(endDate),
    };
    this.render();
  }

  scrollToEvent(eventId) {
    const eventEl = this.element.querySelector(`[data-event-id="${eventId}"]`);
    if (eventEl) {
      eventEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  scrollToDate(date) {
    const position = this.getPositionForDate(date);

    if (this.options.orientation === 'horizontal') {
      const scrollPosition = (this.wrapper.scrollWidth * position) / 100;
      this.wrapper.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    } else {
      const scrollPosition = (this.wrapper.scrollHeight * position) / 100;
      this.wrapper.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
  }

  destroy() {
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

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-timeline]').forEach((element) => {
    new Timeline(element);
  });
});

// Register with component registry if available
if (window.AmphibiousRegistry) {
  window.AmphibiousRegistry.registerComponent('timeline', Timeline);
}

// Export
window.Timeline = Timeline;
export default Timeline;
