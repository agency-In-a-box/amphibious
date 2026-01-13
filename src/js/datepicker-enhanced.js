/**
 * Enhanced Date Picker Component JavaScript
 * Comprehensive date selection with full cleanup and advanced features
 * Part of Amphibious 2.0 Component Library
 */

class DatePickerEnhanced {
  constructor(element, options = {}) {
    this.element = element;

    // Store all event handlers for proper cleanup
    this.handlers = new Map();
    this.dynamicHandlers = new Map();

    // Store all intervals/timeouts
    this.timers = new Set();

    // Store all created DOM elements
    this.createdElements = new Set();

    this.options = {
      format: options.format || 'MM/DD/YYYY',
      minDate: options.minDate || null,
      maxDate: options.maxDate || null,
      disabledDates: options.disabledDates || [],
      disabledDays: options.disabledDays || [], // 0=Sunday, 6=Saturday
      startDate: options.startDate || new Date(),
      inline: options.inline || false,
      showTime: options.showTime || false,
      autoClose: options.autoClose !== false,
      onChange: options.onChange || null,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      onSelect: options.onSelect || null,
      weekStart: options.weekStart || 0, // 0=Sunday, 1=Monday
      yearRange: options.yearRange || 100,
      showWeekNumbers: options.showWeekNumbers || false,
      allowClear: options.allowClear !== false,
      multiple: options.multiple || false,
      range: options.range || false,
      shortcuts: options.shortcuts || true,
      position: options.position || 'auto', // auto, top, bottom
      theme: options.theme || 'light',
      locale: options.locale || 'en-US',
      animations: options.animations !== false,
      ...options,
    };

    // State management
    this.state = {
      isOpen: false,
      viewMode: 'days', // days, months, years
      viewDate: new Date(this.options.startDate),
      selectedDates: [],
      rangeStart: null,
      rangeEnd: null,
      hoveredDate: null,
      focusedDate: null,
    };

    // Parse existing value
    if (this.element.value) {
      this.parseInitialValue();
    }

    this.init();
  }

  init() {
    this.setupDOM();
    this.bindEvents();
    this.setupKeyboardNav();

    if (this.options.inline) {
      this.open();
    }
  }

  setupDOM() {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'datepicker-wrapper';
    if (this.options.theme) {
      wrapper.classList.add(`datepicker-theme-${this.options.theme}`);
    }

    // Wrap the input
    this.element.parentNode.insertBefore(wrapper, this.element);
    wrapper.appendChild(this.element);

    // Make input readonly if not inline
    if (!this.options.inline) {
      this.element.setAttribute('readonly', 'readonly');
    }

    // Add classes
    this.element.classList.add('datepicker-input');

    // Create calendar container
    this.createCalendar();

    // Store references
    this.wrapper = wrapper;
    this.createdElements.add(wrapper);
  }

  createCalendar() {
    const calendar = document.createElement('div');
    calendar.className = 'datepicker-calendar';
    calendar.setAttribute('role', 'dialog');
    calendar.setAttribute('aria-label', 'Date picker');
    calendar.setAttribute('aria-hidden', 'true');

    // Header
    const header = this.createHeader();
    calendar.appendChild(header);

    // Shortcuts
    if (this.options.shortcuts) {
      const shortcuts = this.createShortcuts();
      calendar.appendChild(shortcuts);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'datepicker-body';
    calendar.appendChild(body);

    // Footer
    const footer = this.createFooter();
    calendar.appendChild(footer);

    // Add to wrapper
    this.wrapper.appendChild(calendar);

    this.calendar = calendar;
    this.body = body;
    this.createdElements.add(calendar);

    // Initial render
    this.render();
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'datepicker-header';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'datepicker-prev';
    prevBtn.type = 'button';
    prevBtn.innerHTML = '‹';
    prevBtn.setAttribute('aria-label', 'Previous month');

    // Month/Year display
    const display = document.createElement('div');
    display.className = 'datepicker-display';

    const monthText = document.createElement('button');
    monthText.className = 'datepicker-month-text';
    monthText.type = 'button';

    const yearText = document.createElement('button');
    yearText.className = 'datepicker-year-text';
    yearText.type = 'button';

    display.appendChild(monthText);
    display.appendChild(yearText);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'datepicker-next';
    nextBtn.type = 'button';
    nextBtn.innerHTML = '›';
    nextBtn.setAttribute('aria-label', 'Next month');

    header.appendChild(prevBtn);
    header.appendChild(display);
    header.appendChild(nextBtn);

    // Store references
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.monthText = monthText;
    this.yearText = yearText;

    this.createdElements.add(header);

    return header;
  }

  createShortcuts() {
    const container = document.createElement('div');
    container.className = 'datepicker-shortcuts';

    const shortcuts = [
      { label: 'Today', value: () => new Date() },
      { label: 'Yesterday', value: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d;
      }},
      { label: 'Last Week', value: () => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d;
      }},
      { label: 'Last Month', value: () => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d;
      }},
    ];

    shortcuts.forEach(shortcut => {
      const btn = document.createElement('button');
      btn.className = 'datepicker-shortcut';
      btn.type = 'button';
      btn.textContent = shortcut.label;

      // Store handler
      const handler = () => this.selectDate(shortcut.value());
      this.addHandler(btn, 'click', handler);

      container.appendChild(btn);
    });

    this.createdElements.add(container);
    return container;
  }

  createFooter() {
    const footer = document.createElement('div');
    footer.className = 'datepicker-footer';

    // Today button
    const todayBtn = document.createElement('button');
    todayBtn.className = 'datepicker-today';
    todayBtn.type = 'button';
    todayBtn.textContent = 'Today';

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'datepicker-clear';
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear';

    footer.appendChild(clearBtn);
    footer.appendChild(todayBtn);

    this.todayBtn = todayBtn;
    this.clearBtn = clearBtn;

    this.createdElements.add(footer);

    return footer;
  }

  bindEvents() {
    // Input events
    this.addHandler(this.element, 'click', () => this.toggle());
    this.addHandler(this.element, 'focus', () => this.open());
    this.addHandler(this.element, 'blur', (e) => {
      // Close if focus moves outside datepicker
      const timer = setTimeout(() => {
        if (!this.wrapper.contains(document.activeElement)) {
          this.close();
        }
      }, 200);
      this.timers.add(timer);
    });

    // Navigation
    this.addHandler(this.prevBtn, 'click', () => this.navigate(-1));
    this.addHandler(this.nextBtn, 'click', () => this.navigate(1));

    // View mode switches
    this.addHandler(this.monthText, 'click', () => this.setViewMode('months'));
    this.addHandler(this.yearText, 'click', () => this.setViewMode('years'));

    // Footer buttons
    this.addHandler(this.todayBtn, 'click', () => this.selectToday());
    this.addHandler(this.clearBtn, 'click', () => this.clear());

    // Click outside to close
    const outsideHandler = (e) => {
      if (!this.wrapper.contains(e.target) && this.state.isOpen) {
        this.close();
      }
    };
    this.addHandler(document, 'click', outsideHandler);

    // Window resize
    const resizeHandler = () => this.updatePosition();
    this.addHandler(window, 'resize', resizeHandler);

    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape' && this.state.isOpen) {
        this.close();
        this.element.focus();
      }
    };
    this.addHandler(document, 'keydown', escHandler);
  }

  setupKeyboardNav() {
    const keyHandler = (e) => {
      if (!this.state.isOpen) return;

      const focused = this.state.focusedDate || this.state.viewDate;
      let newDate = new Date(focused);
      let preventDefault = false;

      switch(e.key) {
        case 'ArrowLeft':
          newDate.setDate(newDate.getDate() - 1);
          preventDefault = true;
          break;
        case 'ArrowRight':
          newDate.setDate(newDate.getDate() + 1);
          preventDefault = true;
          break;
        case 'ArrowUp':
          newDate.setDate(newDate.getDate() - 7);
          preventDefault = true;
          break;
        case 'ArrowDown':
          newDate.setDate(newDate.getDate() + 7);
          preventDefault = true;
          break;
        case 'PageUp':
          if (e.shiftKey) {
            newDate.setFullYear(newDate.getFullYear() - 1);
          } else {
            newDate.setMonth(newDate.getMonth() - 1);
          }
          preventDefault = true;
          break;
        case 'PageDown':
          if (e.shiftKey) {
            newDate.setFullYear(newDate.getFullYear() + 1);
          } else {
            newDate.setMonth(newDate.getMonth() + 1);
          }
          preventDefault = true;
          break;
        case 'Home':
          newDate.setDate(1);
          preventDefault = true;
          break;
        case 'End':
          newDate.setMonth(newDate.getMonth() + 1);
          newDate.setDate(0);
          preventDefault = true;
          break;
        case 'Enter':
        case ' ':
          this.selectDate(focused);
          preventDefault = true;
          break;
      }

      if (preventDefault) {
        e.preventDefault();
        this.state.focusedDate = newDate;
        this.state.viewDate = new Date(newDate);
        this.render();
      }
    };

    this.addHandler(this.calendar, 'keydown', keyHandler);
  }

  // Helper to add event handlers with cleanup tracking
  addHandler(element, event, handler, options) {
    element.addEventListener(event, handler, options);

    if (!this.handlers.has(element)) {
      this.handlers.set(element, []);
    }
    this.handlers.get(element).push({ event, handler, options });
  }

  // Render methods
  render() {
    switch(this.state.viewMode) {
      case 'days':
        this.renderDays();
        break;
      case 'months':
        this.renderMonths();
        break;
      case 'years':
        this.renderYears();
        break;
    }

    this.updateHeader();
  }

  renderDays() {
    const year = this.state.viewDate.getFullYear();
    const month = this.state.viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let html = '<div class="datepicker-days">';

    // Week headers
    html += '<div class="datepicker-weekdays">';
    const weekDays = this.getWeekDays();
    weekDays.forEach(day => {
      html += `<div class="datepicker-weekday">${day}</div>`;
    });
    html += '</div>';

    // Days grid
    html += '<div class="datepicker-dates">';

    // Previous month days
    const startDay = (firstDay - this.options.weekStart + 7) % 7;
    for (let i = startDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      html += `<button type="button" class="datepicker-date datepicker-date--other-month"
                data-date="${year}-${month}-${day}">${day}</button>`;
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const classes = this.getDateClasses(date);
      const disabled = this.isDateDisabled(date);

      html += `<button type="button" class="datepicker-date ${classes}"
                data-date="${year}-${month + 1}-${day}"
                ${disabled ? 'disabled' : ''}>${day}</button>`;
    }

    // Next month days
    const totalCells = 42; // 6 weeks
    const filledCells = startDay + daysInMonth;
    for (let day = 1; day <= totalCells - filledCells; day++) {
      html += `<button type="button" class="datepicker-date datepicker-date--other-month"
                data-date="${year}-${month + 2}-${day}">${day}</button>`;
    }

    html += '</div></div>';

    this.body.innerHTML = html;

    // Bind date click events
    this.body.querySelectorAll('.datepicker-date').forEach(btn => {
      if (!btn.disabled) {
        const handler = () => {
          const [y, m, d] = btn.dataset.date.split('-').map(Number);
          this.selectDate(new Date(y, m - 1, d));
        };
        btn.addEventListener('click', handler);
        this.dynamicHandlers.set(btn, { event: 'click', handler });
      }
    });
  }

  renderMonths() {
    const months = this.getMonthNames();
    const currentMonth = new Date().getMonth();
    const viewMonth = this.state.viewDate.getMonth();

    let html = '<div class="datepicker-months">';

    months.forEach((month, index) => {
      const classes = [];
      if (index === currentMonth) classes.push('datepicker-month--current');
      if (index === viewMonth) classes.push('datepicker-month--selected');

      html += `<button type="button" class="datepicker-month ${classes.join(' ')}"
                data-month="${index}">${month}</button>`;
    });

    html += '</div>';

    this.body.innerHTML = html;

    // Bind month click events
    this.body.querySelectorAll('.datepicker-month').forEach(btn => {
      const handler = () => {
        this.state.viewDate.setMonth(parseInt(btn.dataset.month));
        this.state.viewMode = 'days';
        this.render();
      };
      btn.addEventListener('click', handler);
      this.dynamicHandlers.set(btn, { event: 'click', handler });
    });
  }

  renderYears() {
    const currentYear = new Date().getFullYear();
    const viewYear = this.state.viewDate.getFullYear();
    const startYear = Math.floor(viewYear / 10) * 10;

    let html = '<div class="datepicker-years">';

    for (let year = startYear - 1; year <= startYear + 10; year++) {
      const classes = [];
      if (year === currentYear) classes.push('datepicker-year--current');
      if (year === viewYear) classes.push('datepicker-year--selected');
      if (year === startYear - 1 || year === startYear + 10) {
        classes.push('datepicker-year--other');
      }

      html += `<button type="button" class="datepicker-year ${classes.join(' ')}"
                data-year="${year}">${year}</button>`;
    }

    html += '</div>';

    this.body.innerHTML = html;

    // Bind year click events
    this.body.querySelectorAll('.datepicker-year').forEach(btn => {
      const handler = () => {
        this.state.viewDate.setFullYear(parseInt(btn.dataset.year));
        this.state.viewMode = 'months';
        this.render();
      };
      btn.addEventListener('click', handler);
      this.dynamicHandlers.set(btn, { event: 'click', handler });
    });
  }

  // Date helper methods
  getDateClasses(date) {
    const classes = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      classes.push('datepicker-date--today');
    }

    if (this.isDateSelected(date)) {
      classes.push('datepicker-date--selected');
    }

    if (this.state.focusedDate && date.getTime() === this.state.focusedDate.getTime()) {
      classes.push('datepicker-date--focused');
    }

    if (this.options.range && this.state.rangeStart && this.state.rangeEnd) {
      if (date >= this.state.rangeStart && date <= this.state.rangeEnd) {
        classes.push('datepicker-date--in-range');
      }
    }

    return classes.join(' ');
  }

  isDateSelected(date) {
    return this.state.selectedDates.some(d =>
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  }

  isDateDisabled(date) {
    // Check min/max dates
    if (this.options.minDate && date < this.options.minDate) return true;
    if (this.options.maxDate && date > this.options.maxDate) return true;

    // Check disabled days of week
    if (this.options.disabledDays.includes(date.getDay())) return true;

    // Check specific disabled dates
    return this.options.disabledDates.some(d => {
      const disabled = new Date(d);
      return disabled.getFullYear() === date.getFullYear() &&
             disabled.getMonth() === date.getMonth() &&
             disabled.getDate() === date.getDate();
    });
  }

  // Localization helpers
  getMonthNames() {
    const formatter = new Intl.DateTimeFormat(this.options.locale, { month: 'short' });
    return Array.from({ length: 12 }, (_, i) =>
      formatter.format(new Date(2000, i, 1))
    );
  }

  getWeekDays() {
    const formatter = new Intl.DateTimeFormat(this.options.locale, { weekday: 'short' });
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(2000, 0, 2 + ((i + this.options.weekStart) % 7));
      days.push(formatter.format(day));
    }
    return days;
  }

  // Update methods
  updateHeader() {
    const formatter = new Intl.DateTimeFormat(this.options.locale, {
      month: 'long',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(this.state.viewDate);

    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;

    this.monthText.textContent = month;
    this.yearText.textContent = year;
  }

  updatePosition() {
    if (!this.state.isOpen || this.options.inline) return;

    const rect = this.element.getBoundingClientRect();
    const calendarHeight = this.calendar.offsetHeight;

    // Reset classes
    this.calendar.classList.remove('datepicker-calendar--top', 'datepicker-calendar--bottom');

    // Auto position
    if (this.options.position === 'auto') {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < calendarHeight && spaceAbove > spaceBelow) {
        this.calendar.classList.add('datepicker-calendar--top');
      } else {
        this.calendar.classList.add('datepicker-calendar--bottom');
      }
    } else {
      this.calendar.classList.add(`datepicker-calendar--${this.options.position}`);
    }
  }

  updateInput() {
    const formatter = new Intl.DateTimeFormat(this.options.locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    if (this.options.multiple) {
      const dates = this.state.selectedDates.map(d => formatter.format(d));
      this.element.value = dates.join(', ');
    } else if (this.options.range && this.state.rangeStart && this.state.rangeEnd) {
      this.element.value = `${formatter.format(this.state.rangeStart)} - ${formatter.format(this.state.rangeEnd)}`;
    } else if (this.state.selectedDates.length > 0) {
      this.element.value = formatter.format(this.state.selectedDates[0]);
    } else {
      this.element.value = '';
    }
  }

  // Navigation methods
  navigate(direction) {
    switch(this.state.viewMode) {
      case 'days':
        this.state.viewDate.setMonth(this.state.viewDate.getMonth() + direction);
        break;
      case 'months':
        this.state.viewDate.setFullYear(this.state.viewDate.getFullYear() + direction);
        break;
      case 'years':
        this.state.viewDate.setFullYear(this.state.viewDate.getFullYear() + (direction * 10));
        break;
    }
    this.render();
  }

  setViewMode(mode) {
    this.state.viewMode = mode;
    this.render();
  }

  // Selection methods
  selectDate(date) {
    if (this.isDateDisabled(date)) return;

    if (this.options.multiple) {
      const index = this.state.selectedDates.findIndex(d =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );

      if (index > -1) {
        this.state.selectedDates.splice(index, 1);
      } else {
        this.state.selectedDates.push(date);
      }
    } else if (this.options.range) {
      if (!this.state.rangeStart || this.state.rangeEnd) {
        this.state.rangeStart = date;
        this.state.rangeEnd = null;
      } else {
        if (date < this.state.rangeStart) {
          this.state.rangeEnd = this.state.rangeStart;
          this.state.rangeStart = date;
        } else {
          this.state.rangeEnd = date;
        }
      }
      this.state.selectedDates = [this.state.rangeStart, this.state.rangeEnd].filter(Boolean);
    } else {
      this.state.selectedDates = [date];
    }

    this.state.viewDate = new Date(date);
    this.updateInput();
    this.render();

    // Fire callbacks
    if (this.options.onSelect) {
      this.options.onSelect(date, this);
    }

    if (this.options.onChange) {
      this.options.onChange(this.getValue(), this);
    }

    // Auto close
    if (this.options.autoClose && !this.options.multiple && !this.options.range) {
      this.close();
    }
  }

  selectToday() {
    this.selectDate(new Date());
  }

  clear() {
    this.state.selectedDates = [];
    this.state.rangeStart = null;
    this.state.rangeEnd = null;
    this.updateInput();
    this.render();

    if (this.options.onChange) {
      this.options.onChange(null, this);
    }
  }

  // Open/Close methods
  open() {
    if (this.state.isOpen) return;

    this.state.isOpen = true;
    this.calendar.classList.add('datepicker-calendar--open');
    this.calendar.setAttribute('aria-hidden', 'false');

    this.updatePosition();

    if (this.options.onOpen) {
      this.options.onOpen(this);
    }
  }

  close() {
    if (!this.state.isOpen || this.options.inline) return;

    this.state.isOpen = false;
    this.calendar.classList.remove('datepicker-calendar--open');
    this.calendar.setAttribute('aria-hidden', 'true');

    if (this.options.onClose) {
      this.options.onClose(this);
    }
  }

  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  // Parse initial value
  parseInitialValue() {
    try {
      const date = new Date(this.element.value);
      if (!isNaN(date.getTime())) {
        this.state.selectedDates = [date];
        this.state.viewDate = new Date(date);
      }
    } catch (e) {
      // Invalid date, ignore
    }
  }

  // Public API methods
  getValue() {
    if (this.options.multiple) {
      return this.state.selectedDates;
    } else if (this.options.range) {
      return {
        start: this.state.rangeStart,
        end: this.state.rangeEnd,
      };
    } else {
      return this.state.selectedDates[0] || null;
    }
  }

  setValue(value) {
    if (this.options.multiple && Array.isArray(value)) {
      this.state.selectedDates = value.map(v => new Date(v));
    } else if (this.options.range && value.start && value.end) {
      this.state.rangeStart = new Date(value.start);
      this.state.rangeEnd = new Date(value.end);
      this.state.selectedDates = [this.state.rangeStart, this.state.rangeEnd];
    } else if (value) {
      this.state.selectedDates = [new Date(value)];
    } else {
      this.clear();
    }

    this.updateInput();
    this.render();
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    this.render();
  }

  /**
   * Comprehensive destroy method with full cleanup
   */
  destroy() {
    // Close if open
    this.close();

    // Remove all event listeners
    this.handlers.forEach((handlerList, element) => {
      handlerList.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
    });
    this.handlers.clear();

    // Remove dynamic event listeners
    this.dynamicHandlers.forEach((handler, element) => {
      element.removeEventListener(handler.event, handler.handler);
    });
    this.dynamicHandlers.clear();

    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    // Remove all created DOM elements
    this.createdElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.createdElements.clear();

    // Restore original input
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.insertBefore(this.element, this.wrapper);
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    // Remove input modifications
    this.element.classList.remove('datepicker-input');
    this.element.removeAttribute('readonly');

    // Clear all references
    this.element = null;
    this.wrapper = null;
    this.calendar = null;
    this.body = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.monthText = null;
    this.yearText = null;
    this.todayBtn = null;
    this.clearBtn = null;

    // Clear state
    this.state = null;
    this.options = null;
  }
}

// Register with component registry if available
if (window.AmphibiousRegistry) {
  window.AmphibiousRegistry.registerComponent('datepicker', DatePickerEnhanced, {
    selector: '[data-datepicker]',
    autoInit: true,
  });
}

// Export
window.DatePickerEnhanced = DatePickerEnhanced;
export default DatePickerEnhanced;