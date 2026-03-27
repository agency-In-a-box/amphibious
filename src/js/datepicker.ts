/**
 * Date Picker Component TypeScript
 * Lightweight calendar widget with zero dependencies
 * Part of Amphibious 2.0 Component Library
 *
 * @module datepicker
 */

/**
 * Localizable UI labels for the datepicker footer and time-period buttons.
 *
 * @property today - Label for the "Today" button.
 * @property clear - Label for the "Clear" button.
 * @property am - Label for the AM period button.
 * @property pm - Label for the PM period button.
 */
export interface DatepickerLabels {
  today: string;
  clear: string;
  am: string;
  pm: string;
}

/**
 * Configuration options accepted by the {@link DatePicker} constructor.
 *
 * @property format - Date format string (e.g. `'MM/DD/YYYY'`, `'YYYY-MM-DD'`).
 * @property locale - BCP 47 locale tag used with `Intl.DateTimeFormat`.
 * @property minDate - Earliest selectable date.
 * @property maxDate - Latest selectable date.
 * @property disabledDates - Array of specific dates that cannot be selected.
 * @property disabledDays - Array of weekday indices (0=Sunday, 6=Saturday) to disable.
 * @property startDate - Initial date shown by the calendar.
 * @property inline - Render the calendar inline instead of as a dropdown.
 * @property showTime - Include time-picker controls (hour, minute, AM/PM).
 * @property autoClose - Close after a date is selected. Defaults to `true`.
 * @property labels - Localizable UI label strings.
 * @property onChange - Callback fired when the selected date changes.
 * @property onOpen - Callback fired when the calendar opens.
 * @property onClose - Callback fired when the calendar closes.
 */
export interface DatepickerOptions {
  format?: string;
  locale?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  disabledDates?: Date[];
  disabledDays?: number[];
  startDate?: Date;
  inline?: boolean;
  showTime?: boolean;
  autoClose?: boolean;
  labels?: Partial<DatepickerLabels>;
  onChange?: ((date: Date | null, picker: DatePicker) => void) | null;
  onOpen?: ((picker: DatePicker) => void) | null;
  onClose?: ((picker: DatePicker) => void) | null;
}

/** Resolved internal options with all defaults applied. */
interface ResolvedDatepickerOptions {
  format: string;
  locale: string;
  minDate: Date | null;
  maxDate: Date | null;
  disabledDates: Date[];
  disabledDays: number[];
  startDate: Date;
  inline: boolean;
  showTime: boolean;
  autoClose: boolean;
  labels: DatepickerLabels;
  onChange: ((date: Date | null, picker: DatePicker) => void) | null;
  onOpen: ((picker: DatePicker) => void) | null;
  onClose: ((picker: DatePicker) => void) | null;
}

/** Calendar view mode for navigating between day, month, and year grids. */
type ViewMode = 'days' | 'months' | 'years';

/**
 * Lightweight datepicker component with calendar navigation, date selection,
 * disabled-date support, optional time picker, and i18n via `Intl.DateTimeFormat`.
 *
 * Wraps an `<input>` element with a dropdown calendar UI. Uses an
 * `AbortController` for centralized event listener cleanup on {@link destroy}.
 *
 * @example
 * ```ts
 * const picker = new DatePicker(document.querySelector('#my-date')!, {
 *   format: 'YYYY-MM-DD',
 *   locale: 'en-GB',
 *   disabledDays: [0, 6],
 *   onChange: (date) => console.log('Selected:', date),
 * });
 * ```
 */
export class DatePicker {
  public element: HTMLInputElement;
  public options: ResolvedDatepickerOptions;

  public isOpen: boolean;
  public currentDate: Date;
  public selectedDate: Date | null;
  public viewDate: Date;
  public viewMode: ViewMode;

  // DOM references created in createDatePicker() / createHeader() / createFooter()
  public wrapper!: HTMLDivElement;
  public dropdown!: HTMLDivElement;
  public body!: HTMLDivElement;
  public prevBtn!: HTMLButtonElement;
  public nextBtn!: HTMLButtonElement;
  public monthText!: HTMLSpanElement;
  public yearText!: HTMLSpanElement;
  public todayBtn!: HTMLButtonElement;
  public clearBtn!: HTMLButtonElement;

  // Time-picker DOM references (only created when showTime is true)
  public hourInput!: HTMLInputElement;
  public minuteInput!: HTMLInputElement;
  public amBtn!: HTMLButtonElement;
  public pmBtn!: HTMLButtonElement;

  private _abortController: AbortController;

  constructor(element: HTMLInputElement, options: DatepickerOptions = {}) {
    this.element = element;
    this.options = {
      format: options.format || 'MM/DD/YYYY',
      locale: options.locale || 'en-US',
      minDate: options.minDate || null,
      maxDate: options.maxDate || null,
      disabledDates: options.disabledDates || [],
      disabledDays: options.disabledDays || [], // 0=Sunday, 6=Saturday
      startDate: options.startDate || new Date(),
      inline: options.inline || false,
      showTime: options.showTime || false,
      autoClose: options.autoClose !== false,
      labels: { today: 'Today', clear: 'Clear', am: 'AM', pm: 'PM', ...(options.labels || {}) },
      onChange: options.onChange || null,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
    };

    this.isOpen = false;
    this.currentDate = new Date();
    this.selectedDate = null;
    this.viewDate = new Date();
    this.viewMode = 'days';
    this._abortController = new AbortController();

    this.init();
  }

  private init(): void {
    this.createDatePicker();
    this.bindEvents();

    if (this.element.value) {
      this.setDate(this.element.value);
    }
  }

  private createDatePicker(): void {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'aiab-datepicker';
    if (this.options.inline) {
      wrapper.classList.add('aiab-datepicker--inline');
    }

    // Wrap original input
    this.element.parentNode?.insertBefore(wrapper, this.element);
    wrapper.appendChild(this.element);

    // Add class to input
    this.element.classList.add('aiab-datepicker-input');
    this.element.setAttribute('readonly', 'readonly');

    // Add calendar icon
    const icon = document.createElement('span');
    icon.className = 'aiab-datepicker-icon';
    icon.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    `;
    wrapper.appendChild(icon);

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'aiab-datepicker-dropdown';

    // Create header
    const header = this.createHeader();
    dropdown.appendChild(header);

    // Create body
    const body = document.createElement('div');
    body.className = 'aiab-datepicker-body';
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

    this.wrapper = wrapper as HTMLDivElement;
    this.dropdown = dropdown as HTMLDivElement;
    this.body = body as HTMLDivElement;

    // Render initial view
    this.render();
  }

  private createHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.className = 'aiab-datepicker-header';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'aiab-datepicker-nav-button aiab-datepicker-prev';
    prevBtn.type = 'button';
    prevBtn.innerHTML = `
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    `;

    // Month/Year display
    const monthYear = document.createElement('div');
    monthYear.className = 'aiab-datepicker-month-year';

    const monthSelect = document.createElement('span');
    monthSelect.className = 'aiab-datepicker-month-text';

    const yearSelect = document.createElement('span');
    yearSelect.className = 'aiab-datepicker-year-text';

    monthYear.appendChild(monthSelect);
    monthYear.appendChild(yearSelect);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'aiab-datepicker-nav-button aiab-datepicker-next';
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

    return header as HTMLDivElement;
  }

  private createTimePicker(): HTMLDivElement {
    const timePicker = document.createElement('div');
    timePicker.className = 'aiab-datepicker-time';

    const hourInput = document.createElement('input');
    hourInput.type = 'number';
    hourInput.className = 'aiab-datepicker-time-input aiab-datepicker-hour';
    hourInput.min = '1';
    hourInput.max = '12';
    hourInput.value = '12';

    const separator = document.createElement('span');
    separator.className = 'aiab-datepicker-time-separator';
    separator.textContent = ':';

    const minuteInput = document.createElement('input');
    minuteInput.type = 'number';
    minuteInput.className = 'aiab-datepicker-time-input aiab-datepicker-minute';
    minuteInput.min = '0';
    minuteInput.max = '59';
    minuteInput.value = '00';

    const periodDiv = document.createElement('div');
    periodDiv.className = 'aiab-datepicker-time-period';

    const amBtn = document.createElement('button');
    amBtn.type = 'button';
    amBtn.className = 'aiab-datepicker-time-period-btn aiab-datepicker-time-period-btn--active';
    amBtn.textContent = this.options.labels.am;

    const pmBtn = document.createElement('button');
    pmBtn.type = 'button';
    pmBtn.className = 'aiab-datepicker-time-period-btn';
    pmBtn.textContent = this.options.labels.pm;

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

    return timePicker as HTMLDivElement;
  }

  private createFooter(): HTMLDivElement {
    const footer = document.createElement('div');
    footer.className = 'aiab-datepicker-footer';

    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'aiab-datepicker-today-btn';
    todayBtn.textContent = this.options.labels.today;

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'aiab-datepicker-clear-btn';
    clearBtn.textContent = this.options.labels.clear;

    footer.appendChild(todayBtn);
    footer.appendChild(clearBtn);

    this.todayBtn = todayBtn;
    this.clearBtn = clearBtn;

    return footer as HTMLDivElement;
  }

  private bindEvents(): void {
    const signal = this._abortController.signal;

    // Toggle calendar
    this.element.addEventListener('click', () => this.toggle(), { signal });
    this.element.addEventListener('focus', () => this.open(), { signal });

    // Navigation
    this.prevBtn.addEventListener('click', () => this.navigate(-1), { signal });
    this.nextBtn.addEventListener('click', () => this.navigate(1), { signal });

    // Month/Year click
    this.monthText.addEventListener('click', () => this.showMonths(), { signal });
    this.yearText.addEventListener('click', () => this.showYears(), { signal });

    // Footer buttons
    this.todayBtn.addEventListener('click', () => this.selectToday(), { signal });
    this.clearBtn.addEventListener('click', () => this.clear(), { signal });

    // Time picker events
    if (this.options.showTime) {
      this.amBtn.addEventListener('click', () => this.setPeriod('AM'), { signal });
      this.pmBtn.addEventListener('click', () => this.setPeriod('PM'), { signal });

      this.hourInput.addEventListener('change', () => this.updateTime(), { signal });
      this.minuteInput.addEventListener('change', () => this.updateTime(), { signal });
    }

    // Click outside to close
    document.addEventListener(
      'click',
      (e: MouseEvent) => {
        if (!this.wrapper.contains(e.target as Node) && this.isOpen) {
          this.close();
        }
      },
      { signal },
    );

    // Keyboard navigation
    this.element.addEventListener('keydown', (e: KeyboardEvent) => this.handleKeydown(e), {
      signal,
    });
  }

  private render(): void {
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

  private renderDays(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    // Update header using locale-aware month name
    const monthFormatter = new Intl.DateTimeFormat(this.options.locale, { month: 'long' });
    this.monthText.textContent = monthFormatter.format(new Date(year, month, 1));
    this.yearText.textContent = String(year);

    // Clear body
    this.body.innerHTML = '';

    // Weekdays
    const weekdays = document.createElement('div');
    weekdays.className = 'aiab-datepicker-weekdays';
    const dayFormatter = new Intl.DateTimeFormat(this.options.locale, { weekday: 'narrow' });
    const dayNames = Array.from({ length: 7 }, (_, i) =>
      dayFormatter.format(new Date(2000, 0, 2 + i)),
    );
    dayNames.forEach((day: string) => {
      const weekday = document.createElement('div');
      weekday.className = 'aiab-datepicker-weekday';
      weekday.textContent = day;
      weekdays.appendChild(weekday);
    });
    this.body.appendChild(weekdays);

    // Days grid
    const daysGrid = document.createElement('div');
    daysGrid.className = 'aiab-datepicker-days';

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

  private createDayButton(date: Date, type = ''): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'aiab-datepicker-day';
    button.textContent = String(date.getDate());
    button.dataset.date = date.toISOString();

    if (type === 'other-month') {
      button.classList.add('aiab-datepicker-day--other-month');
    }

    // Check if today
    if (this.isToday(date)) {
      button.classList.add('aiab-datepicker-day--today');
    }

    // Check if selected
    if (this.selectedDate && this.isSameDay(date, this.selectedDate)) {
      button.classList.add('aiab-datepicker-day--selected');
    }

    // Check if disabled
    if (this.isDisabled(date)) {
      button.classList.add('aiab-datepicker-day--disabled');
      button.disabled = true;
    }

    // Add click event
    button.addEventListener('click', () => this.selectDate(date));

    return button;
  }

  private renderMonths(): void {
    const year = this.viewDate.getFullYear();

    // Update header
    this.monthText.textContent = '';
    this.yearText.textContent = String(year);

    // Clear body
    this.body.innerHTML = '';

    const monthsGrid = document.createElement('div');
    monthsGrid.className = 'aiab-datepicker-months';

    const shortMonthFormatter = new Intl.DateTimeFormat(this.options.locale, { month: 'short' });
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      shortMonthFormatter.format(new Date(2000, i, 1)),
    );

    monthNames.forEach((name: string, index: number) => {
      const monthBtn = document.createElement('button');
      monthBtn.type = 'button';
      monthBtn.className = 'aiab-datepicker-month-option';
      monthBtn.textContent = name;

      if (index === this.currentDate.getMonth() && year === this.currentDate.getFullYear()) {
        monthBtn.classList.add('aiab-datepicker-month-option--current');
      }

      if (
        this.selectedDate &&
        index === this.selectedDate.getMonth() &&
        year === this.selectedDate.getFullYear()
      ) {
        monthBtn.classList.add('aiab-datepicker-month-option--selected');
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

  private renderYears(): void {
    const currentYear = this.viewDate.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;

    // Update header
    this.monthText.textContent = '';
    this.yearText.textContent = `${startYear} - ${startYear + 9}`;

    // Clear body
    this.body.innerHTML = '';

    const yearsGrid = document.createElement('div');
    yearsGrid.className = 'aiab-datepicker-years';

    for (let i = 0; i < 12; i++) {
      const year = startYear - 1 + i;
      const yearBtn = document.createElement('button');
      yearBtn.type = 'button';
      yearBtn.className = 'aiab-datepicker-year-option';
      yearBtn.textContent = String(year);

      if (year === this.currentDate.getFullYear()) {
        yearBtn.classList.add('aiab-datepicker-year-option--current');
      }

      if (this.selectedDate && year === this.selectedDate.getFullYear()) {
        yearBtn.classList.add('aiab-datepicker-year-option--selected');
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

  private navigate(direction: number): void {
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

  public showMonths(): void {
    if (this.viewMode !== 'months') {
      this.viewMode = 'months';
      this.render();
    }
  }

  public showYears(): void {
    if (this.viewMode !== 'years') {
      this.viewMode = 'years';
      this.render();
    }
  }

  // Selection methods

  public selectDate(date: Date): void {
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

  public selectToday(): void {
    this.selectDate(new Date());
  }

  public clear(): void {
    this.selectedDate = null;
    this.element.value = '';
    this.render();

    if (this.options.onChange) {
      this.options.onChange(null, this);
    }
  }

  public setDate(date: Date | string): void {
    let parsedDate: Date | string = date;
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

  private setPeriod(period: 'AM' | 'PM'): void {
    this.amBtn.classList.toggle('aiab-datepicker-time-period-btn--active', period === 'AM');
    this.pmBtn.classList.toggle('aiab-datepicker-time-period-btn--active', period === 'PM');
    this.updateTime();
  }

  private updateTime(): void {
    if (this.selectedDate && this.options.showTime) {
      let hours = Number.parseInt(this.hourInput.value, 10) || 12;
      const minutes = Number.parseInt(this.minuteInput.value, 10) || 0;
      const isPM = this.pmBtn.classList.contains('aiab-datepicker-time-period-btn--active');

      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      this.selectedDate.setHours(hours, minutes);
      this.updateInput();
    }
  }

  // Format methods

  private updateInput(): void {
    if (this.selectedDate) {
      this.element.value = this.formatDate(this.selectedDate);
    }
  }

  public formatDate(date: Date): string {
    let format = this.options.format;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    format = format.replace('YYYY', String(year));
    format = format.replace('MM', month);
    format = format.replace('DD', day);

    if (this.options.showTime) {
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? 'PM' : 'AM';
      format += ` ${displayHours}:${minutes} ${period}`;
    }

    return format;
  }

  private parseDate(str: string): Date {
    // Simple date parsing - expand as needed
    const parts = str.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
    }
    return new Date(str);
  }

  // Utility methods

  private isToday(date: Date): boolean {
    return this.isSameDay(date, this.currentDate);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  private isDisabled(date: Date): boolean {
    // Check min/max dates
    if (this.options.minDate && date < this.options.minDate) return true;
    if (this.options.maxDate && date > this.options.maxDate) return true;

    // Check disabled days of week
    if (this.options.disabledDays.includes(date.getDay())) return true;

    // Check specific disabled dates
    return this.options.disabledDates.some((d: Date) => this.isSameDay(date, d));
  }

  // Control methods

  public open(): void {
    if (!this.isOpen && !this.options.inline) {
      this.isOpen = true;
      this.wrapper.classList.add('open');

      if (this.options.onOpen) {
        this.options.onOpen(this);
      }
    }
  }

  public close(): void {
    if (this.isOpen && !this.options.inline) {
      this.isOpen = false;
      this.wrapper.classList.remove('open');

      if (this.options.onClose) {
        this.options.onClose(this);
      }
    }
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
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

  /**
   * Fully tear down the datepicker: abort all event listeners, remove the
   * custom wrapper DOM, and restore the original input element.
   */
  public destroy(): void {
    this._abortController.abort();
    this.wrapper.replaceWith(this.element);
    this.element.classList.remove('aiab-datepicker-input');
    this.element.removeAttribute('readonly');
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  try {
    const datepickers = document.querySelectorAll('[data-datepicker="true"]');
    datepickers.forEach((element) => {
      new DatePicker(element as HTMLInputElement);
    });
  } catch (error) {
    console.error('[Amphibious] DatePicker auto-init failed:', error);
  }
});

// Global API
// biome-ignore lint/suspicious/noExplicitAny: global window assignment for non-module consumers
(window as any).DatePicker = DatePicker;

export default DatePicker;
export { DatePicker as DatePickerComponent };
