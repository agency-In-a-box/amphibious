/**
 * Date Picker Component JavaScript
 * Lightweight calendar widget with zero dependencies
 * Part of Amphibious 2.0 Component Library
 */

class DatePicker {
  constructor(element, options = {}) {
    this.element = element;
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
      ...options,
    };

    this.isOpen = false;
    this.currentDate = new Date();
    this.selectedDate = null;
    this.viewDate = new Date();
    this.viewMode = 'days'; // days, months, years

    this.init();
  }

  init() {
    this.createDatePicker();
    this.bindEvents();

    if (this.element.value) {
      this.setDate(this.element.value);
    }
  }

  createDatePicker() {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'datepicker';
    if (this.options.inline) {
      wrapper.classList.add('datepicker--inline');
    }

    // Wrap original input
    this.element.parentNode.insertBefore(wrapper, this.element);
    wrapper.appendChild(this.element);

    // Add class to input
    this.element.classList.add('datepicker-input');
    this.element.setAttribute('readonly', 'readonly');

    // Add calendar icon
    const icon = document.createElement('span');
    icon.className = 'datepicker-icon';
    icon.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    `;
    wrapper.appendChild(icon);

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'datepicker-dropdown';

    // Create header
    const header = this.createHeader();
    dropdown.appendChild(header);

    // Create body
    const body = document.createElement('div');
    body.className = 'datepicker-body';
    dropdown.appendChild(body);

    // Create time picker if enabled
    if (this.options.showTime) {
      const timePicker = this.createTimePicker();
      dropdown.appendChild(timePicker);
    }

    // Create footer
    const footer = this.createFooter();
    dropdown.appendChild(footer);

    wrapper.appendChild(dropdown);

    this.wrapper = wrapper;
    this.dropdown = dropdown;
    this.body = body;

    // Render initial view
    this.render();
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'datepicker-header';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'datepicker-nav-button datepicker-prev';
    prevBtn.type = 'button';
    prevBtn.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    `;

    // Month/Year display
    const monthYear = document.createElement('div');
    monthYear.className = 'datepicker-month-year';

    const monthSelect = document.createElement('span');
    monthSelect.className = 'datepicker-month-text';

    const yearSelect = document.createElement('span');
    yearSelect.className = 'datepicker-year-text';

    monthYear.appendChild(monthSelect);
    monthYear.appendChild(yearSelect);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'datepicker-nav-button datepicker-next';
    nextBtn.type = 'button';
    nextBtn.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    `;

    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);

    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.monthText = monthSelect;
    this.yearText = yearSelect;

    return header;
  }

  createTimePicker() {
    const timePicker = document.createElement('div');
    timePicker.className = 'datepicker-time';

    const hourInput = document.createElement('input');
    hourInput.type = 'number';
    hourInput.className = 'datepicker-time-input datepicker-hour';
    hourInput.min = '1';
    hourInput.max = '12';
    hourInput.value = '12';

    const separator = document.createElement('span');
    separator.className = 'datepicker-time-separator';
    separator.textContent = ':';

    const minuteInput = document.createElement('input');
    minuteInput.type = 'number';
    minuteInput.className = 'datepicker-time-input datepicker-minute';
    minuteInput.min = '0';
    minuteInput.max = '59';
    minuteInput.value = '00';

    const periodDiv = document.createElement('div');
    periodDiv.className = 'datepicker-time-period';

    const amBtn = document.createElement('button');
    amBtn.type = 'button';
    amBtn.className = 'datepicker-time-period-btn datepicker-time-period-btn--active';
    amBtn.textContent = 'AM';

    const pmBtn = document.createElement('button');
    pmBtn.type = 'button';
    pmBtn.className = 'datepicker-time-period-btn';
    pmBtn.textContent = 'PM';

    periodDiv.appendChild(amBtn);
    periodDiv.appendChild(pmBtn);

    timePicker.appendChild(hourInput);
    timePicker.appendChild(separator);
    timePicker.appendChild(minuteInput);
    timePicker.appendChild(periodDiv);

    this.hourInput = hourInput;
    this.minuteInput = minuteInput;
    this.amBtn = amBtn;
    this.pmBtn = pmBtn;

    return timePicker;
  }

  createFooter() {
    const footer = document.createElement('div');
    footer.className = 'datepicker-footer';

    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'datepicker-today-btn';
    todayBtn.textContent = 'Today';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'datepicker-clear-btn';
    clearBtn.textContent = 'Clear';

    footer.appendChild(todayBtn);
    footer.appendChild(clearBtn);

    this.todayBtn = todayBtn;
    this.clearBtn = clearBtn;

    return footer;
  }

  bindEvents() {
    // Toggle calendar
    this.element.addEventListener('click', () => this.toggle());
    this.element.addEventListener('focus', () => this.open());

    // Navigation
    this.prevBtn.addEventListener('click', () => this.navigate(-1));
    this.nextBtn.addEventListener('click', () => this.navigate(1));

    // Month/Year click
    this.monthText.addEventListener('click', () => this.showMonths());
    this.yearText.addEventListener('click', () => this.showYears());

    // Footer buttons
    this.todayBtn.addEventListener('click', () => this.selectToday());
    this.clearBtn.addEventListener('click', () => this.clear());

    // Time picker events
    if (this.options.showTime) {
      this.amBtn.addEventListener('click', () => this.setPeriod('AM'));
      this.pmBtn.addEventListener('click', () => this.setPeriod('PM'));

      this.hourInput.addEventListener('change', () => this.updateTime());
      this.minuteInput.addEventListener('change', () => this.updateTime());
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target) && this.isOpen) {
        this.close();
      }
    });

    // Keyboard navigation
    this.element.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  render() {
    switch (this.viewMode) {
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
  }

  renderDays() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    // Update header
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.monthText.textContent = monthNames[month];
    this.yearText.textContent = year;

    // Clear body
    this.body.innerHTML = '';

    // Weekdays
    const weekdays = document.createElement('div');
    weekdays.className = 'datepicker-weekdays';
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayNames.forEach((day) => {
      const weekday = document.createElement('div');
      weekday.className = 'datepicker-weekday';
      weekday.textContent = day;
      weekdays.appendChild(weekday);
    });
    this.body.appendChild(weekdays);

    // Days grid
    const daysGrid = document.createElement('div');
    daysGrid.className = 'datepicker-days';

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    // Previous month days
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevLastDay.getDate() - i;
      const dayBtn = this.createDayButton(new Date(year, month - 1, day), 'other-month');
      daysGrid.appendChild(dayBtn);
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayBtn = this.createDayButton(date);
      daysGrid.appendChild(dayBtn);
    }

    // Next month days
    const remainingDays = 42 - daysGrid.children.length;
    for (let day = 1; day <= remainingDays; day++) {
      const dayBtn = this.createDayButton(new Date(year, month + 1, day), 'other-month');
      daysGrid.appendChild(dayBtn);
    }

    this.body.appendChild(daysGrid);
  }

  createDayButton(date, type = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'datepicker-day';
    button.textContent = date.getDate();
    button.dataset.date = date.toISOString();

    if (type === 'other-month') {
      button.classList.add('datepicker-day--other-month');
    }

    // Check if today
    if (this.isToday(date)) {
      button.classList.add('datepicker-day--today');
    }

    // Check if selected
    if (this.selectedDate && this.isSameDay(date, this.selectedDate)) {
      button.classList.add('datepicker-day--selected');
    }

    // Check if disabled
    if (this.isDisabled(date)) {
      button.classList.add('datepicker-day--disabled');
      button.disabled = true;
    }

    // Add click event
    button.addEventListener('click', () => this.selectDate(date));

    return button;
  }

  renderMonths() {
    const year = this.viewDate.getFullYear();

    // Update header
    this.monthText.textContent = '';
    this.yearText.textContent = year;

    // Clear body
    this.body.innerHTML = '';

    const monthsGrid = document.createElement('div');
    monthsGrid.className = 'datepicker-months';

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    monthNames.forEach((name, index) => {
      const monthBtn = document.createElement('button');
      monthBtn.type = 'button';
      monthBtn.className = 'datepicker-month-option';
      monthBtn.textContent = name;

      if (index === this.currentDate.getMonth() && year === this.currentDate.getFullYear()) {
        monthBtn.classList.add('datepicker-month-option--current');
      }

      if (
        this.selectedDate &&
        index === this.selectedDate.getMonth() &&
        year === this.selectedDate.getFullYear()
      ) {
        monthBtn.classList.add('datepicker-month-option--selected');
      }

      monthBtn.addEventListener('click', () => {
        this.viewDate.setMonth(index);
        this.viewMode = 'days';
        this.render();
      });

      monthsGrid.appendChild(monthBtn);
    });

    this.body.appendChild(monthsGrid);
  }

  renderYears() {
    const currentYear = this.viewDate.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;

    // Update header
    this.monthText.textContent = '';
    this.yearText.textContent = `${startYear} - ${startYear + 9}`;

    // Clear body
    this.body.innerHTML = '';

    const yearsGrid = document.createElement('div');
    yearsGrid.className = 'datepicker-years';

    for (let i = 0; i < 12; i++) {
      const year = startYear - 1 + i;
      const yearBtn = document.createElement('button');
      yearBtn.type = 'button';
      yearBtn.className = 'datepicker-year-option';
      yearBtn.textContent = year;

      if (year === this.currentDate.getFullYear()) {
        yearBtn.classList.add('datepicker-year-option--current');
      }

      if (this.selectedDate && year === this.selectedDate.getFullYear()) {
        yearBtn.classList.add('datepicker-year-option--selected');
      }

      yearBtn.addEventListener('click', () => {
        this.viewDate.setFullYear(year);
        this.viewMode = 'months';
        this.render();
      });

      yearsGrid.appendChild(yearBtn);
    }

    this.body.appendChild(yearsGrid);
  }

  // Navigation methods
  navigate(direction) {
    switch (this.viewMode) {
      case 'days':
        this.viewDate.setMonth(this.viewDate.getMonth() + direction);
        break;
      case 'months':
        this.viewDate.setFullYear(this.viewDate.getFullYear() + direction);
        break;
      case 'years':
        this.viewDate.setFullYear(this.viewDate.getFullYear() + direction * 10);
        break;
    }
    this.render();
  }

  showMonths() {
    if (this.viewMode !== 'months') {
      this.viewMode = 'months';
      this.render();
    }
  }

  showYears() {
    if (this.viewMode !== 'years') {
      this.viewMode = 'years';
      this.render();
    }
  }

  // Selection methods
  selectDate(date) {
    this.selectedDate = date;
    this.viewDate = new Date(date);
    this.updateInput();
    this.render();

    if (this.options.autoClose && !this.options.showTime) {
      this.close();
    }

    if (this.options.onChange) {
      this.options.onChange(date, this);
    }
  }

  selectToday() {
    this.selectDate(new Date());
  }

  clear() {
    this.selectedDate = null;
    this.element.value = '';
    this.render();

    if (this.options.onChange) {
      this.options.onChange(null, this);
    }
  }

  setDate(date) {
    let parsedDate = date;
    if (typeof date === 'string') {
      parsedDate = this.parseDate(date);
    }
    if (parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime())) {
      this.selectedDate = parsedDate;
      this.viewDate = new Date(parsedDate);
      this.updateInput();
      this.render();
    }
  }

  // Time methods
  setPeriod(period) {
    this.amBtn.classList.toggle('datepicker-time-period-btn--active', period === 'AM');
    this.pmBtn.classList.toggle('datepicker-time-period-btn--active', period === 'PM');
    this.updateTime();
  }

  updateTime() {
    if (this.selectedDate && this.options.showTime) {
      let hours = Number.parseInt(this.hourInput.value) || 12;
      const minutes = Number.parseInt(this.minuteInput.value) || 0;
      const isPM = this.pmBtn.classList.contains('datepicker-time-period-btn--active');

      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      this.selectedDate.setHours(hours, minutes);
      this.updateInput();
    }
  }

  // Format methods
  updateInput() {
    if (this.selectedDate) {
      this.element.value = this.formatDate(this.selectedDate);
    }
  }

  formatDate(date) {
    let format = this.options.format;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    format = format.replace('YYYY', year);
    format = format.replace('MM', month);
    format = format.replace('DD', day);

    if (this.options.showTime) {
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? 'PM' : 'AM';
      format += ` ${displayHours}:${minutes} ${period}`;
    }

    return format;
  }

  parseDate(str) {
    // Simple date parsing - expand as needed
    const parts = str.split('/');
    if (parts.length === 3) {
      return new Date(parts[2], parts[0] - 1, parts[1]);
    }
    return new Date(str);
  }

  // Utility methods
  isToday(date) {
    return this.isSameDay(date, this.currentDate);
  }

  isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  isDisabled(date) {
    // Check min/max dates
    if (this.options.minDate && date < this.options.minDate) return true;
    if (this.options.maxDate && date > this.options.maxDate) return true;

    // Check disabled days of week
    if (this.options.disabledDays.includes(date.getDay())) return true;

    // Check specific disabled dates
    return this.options.disabledDates.some((d) => this.isSameDay(date, d));
  }

  // Control methods
  open() {
    if (!this.isOpen && !this.options.inline) {
      this.isOpen = true;
      this.wrapper.classList.add('open');

      if (this.options.onOpen) {
        this.options.onOpen(this);
      }
    }
  }

  close() {
    if (this.isOpen && !this.options.inline) {
      this.isOpen = false;
      this.wrapper.classList.remove('open');

      if (this.options.onClose) {
        this.options.onClose(this);
      }
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  handleKeydown(e) {
    if (!this.isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.open();
      }
    } else {
      if (e.key === 'Escape') {
        this.close();
        this.element.focus();
      }
    }
  }

  // Public API
  destroy() {
    // Remove event listeners and DOM elements
    this.wrapper.replaceWith(this.element);
    this.element.classList.remove('datepicker-input');
    this.element.removeAttribute('readonly');
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const datepickers = document.querySelectorAll('[data-datepicker="true"]');
  datepickers.forEach((element) => {
    new DatePicker(element);
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DatePicker;
}

window.DatePicker = DatePicker;
