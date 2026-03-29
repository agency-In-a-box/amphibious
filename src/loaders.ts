/**
 * Dynamic import loaders for Amphibious components.
 *
 * Each function returns a Promise that resolves to the component module,
 * enabling runtime lazy loading of heavy components.
 *
 * @example
 * ```ts
 * import { loadFormBuilder } from '@agency-in-a-box/amphibious/loaders';
 *
 * button.addEventListener('click', async () => {
 *   const { FormBuilder } = await loadFormBuilder();
 *   new FormBuilder(container, options);
 * });
 * ```
 *
 * @module loaders
 */

export function loadCarousel() {
  return import('./js/carousel');
}

export function loadModal() {
  return import('./js/modal');
}

export function loadForms() {
  return import('./js/forms');
}

export function loadTabs() {
  return import('./js/tabs');
}

export function loadTooltip() {
  return import('./js/tooltip');
}

export function loadAccordion() {
  return import('./js/accordion');
}

export function loadToast() {
  return import('./js/toast');
}

export function loadSmoothScroll() {
  return import('./js/smooth-scroll');
}

export function loadNavigation() {
  return import('./js/navigation');
}

export function loadDarkModeToggle() {
  return import('./js/dark-mode-toggle');
}

export function loadFormBuilder() {
  return import('./js/form-builder');
}

export function loadFileUpload() {
  return import('./js/file-upload-enhanced');
}

export function loadSearchBar() {
  return import('./js/search-bar-enhanced');
}

export function loadDropdown() {
  return import('./js/dropdown-enhanced');
}

export function loadColorPicker() {
  return import('./js/color-picker');
}

export function loadTimeline() {
  return import('./js/timeline');
}

export function loadDatepicker() {
  return import('./js/datepicker-enhanced');
}

export function loadRangeSlider() {
  return import('./js/range-slider');
}

export function loadDataTable() {
  return import('./js/data-table');
}
