import { describe, expect, it } from 'bun:test';

describe('Per-component entry points', () => {
  it('carousel entry exports AmphibiousCarousel', async () => {
    const mod = await import('../src/entries/carousel');
    expect(mod.AmphibiousCarousel).toBeDefined();
    expect(typeof mod.AmphibiousCarousel).toBe('function');
  });

  it('modal entry exports Modal and ModalManager', async () => {
    const mod = await import('../src/entries/modal');
    expect(mod.Modal).toBeDefined();
    expect(mod.ModalManager).toBeDefined();
    expect(typeof mod.Modal).toBe('function');
  });

  it('forms entry exports Forms', async () => {
    const mod = await import('../src/entries/forms');
    expect(mod.Forms).toBeDefined();
    expect(typeof mod.Forms).toBe('function');
  });

  it('tabs entry exports Tabs', async () => {
    const mod = await import('../src/entries/tabs');
    expect(mod.Tabs).toBeDefined();
    expect(typeof mod.Tabs).toBe('function');
  });

  it('tooltip entry exports Tooltip and EcommerceTooltips', async () => {
    const mod = await import('../src/entries/tooltip');
    expect(mod.Tooltip).toBeDefined();
    expect(mod.EcommerceTooltips).toBeDefined();
  });

  it('accordion entry exports Accordion', async () => {
    const mod = await import('../src/entries/accordion');
    expect(mod.Accordion).toBeDefined();
    expect(typeof mod.Accordion).toBe('function');
  });

  it('toast entry exports ToastComponent', async () => {
    const mod = await import('../src/entries/toast');
    expect(mod.ToastComponent).toBeDefined();
    expect(typeof mod.ToastComponent).toBe('function');
  });

  it('smooth-scroll entry exports SmoothScroll', async () => {
    const mod = await import('../src/entries/smooth-scroll');
    expect(mod.SmoothScroll).toBeDefined();
    expect(typeof mod.SmoothScroll).toBe('function');
  });

  it('navigation entry exports Navigation', async () => {
    const mod = await import('../src/entries/navigation');
    expect(mod.Navigation).toBeDefined();
    expect(typeof mod.Navigation).toBe('function');
  });

  it('dark-mode-toggle entry exports DarkModeToggle', async () => {
    const mod = await import('../src/entries/dark-mode-toggle');
    expect(mod.DarkModeToggle).toBeDefined();
    expect(typeof mod.DarkModeToggle).toBe('function');
  });

  it('icons entry exports Icon, EcommerceIcons, and lightweight helpers', async () => {
    const mod = await import('../src/entries/icons');
    expect(mod.Icon).toBeDefined();
    expect(mod.EcommerceIcons).toBeDefined();
    expect(typeof mod.createIcon).toBe('function');
    expect(typeof mod.getAvailableIcons).toBe('function');
    expect(typeof mod.hasIcon).toBe('function');
    expect(typeof mod.initializeIcons).toBe('function');
  });

  it('form-builder entry exports FormBuilder', async () => {
    const mod = await import('../src/entries/form-builder');
    expect(mod.FormBuilder).toBeDefined();
    expect(typeof mod.FormBuilder).toBe('function');
  });

  it('file-upload entry exports FileUploadEnhanced', async () => {
    const mod = await import('../src/entries/file-upload');
    expect(mod.FileUploadEnhanced).toBeDefined();
    expect(typeof mod.FileUploadEnhanced).toBe('function');
  });

  it('search-bar entry exports SearchBarEnhanced', async () => {
    const mod = await import('../src/entries/search-bar');
    expect(mod.SearchBarEnhanced).toBeDefined();
    expect(typeof mod.SearchBarEnhanced).toBe('function');
  });

  it('dropdown entry exports DropdownEnhanced', async () => {
    const mod = await import('../src/entries/dropdown');
    expect(mod.DropdownEnhanced).toBeDefined();
    expect(typeof mod.DropdownEnhanced).toBe('function');
  });

  it('color-picker entry exports ColorPicker', async () => {
    const mod = await import('../src/entries/color-picker');
    expect(mod.ColorPicker).toBeDefined();
    expect(typeof mod.ColorPicker).toBe('function');
  });

  it('timeline entry exports Timeline', async () => {
    const mod = await import('../src/entries/timeline');
    expect(mod.Timeline).toBeDefined();
    expect(typeof mod.Timeline).toBe('function');
  });

  it('datepicker entry exports DatePickerEnhanced', async () => {
    const mod = await import('../src/entries/datepicker');
    expect(mod.DatePickerEnhanced).toBeDefined();
    expect(typeof mod.DatePickerEnhanced).toBe('function');
  });

  it('range-slider entry exports RangeSlider', async () => {
    const mod = await import('../src/entries/range-slider');
    expect(mod.RangeSlider).toBeDefined();
    expect(typeof mod.RangeSlider).toBe('function');
  });

  it('data-table entry exports DataTableComponent', async () => {
    const mod = await import('../src/entries/data-table');
    expect(mod.DataTableComponent).toBeDefined();
    expect(typeof mod.DataTableComponent).toBe('function');
  });

  it('component-registry entry exports ComponentRegistry', async () => {
    // ComponentRegistry auto-creates a singleton that uses MutationObserver;
    // provide a stub if missing in the test environment
    if (typeof globalThis.MutationObserver === 'undefined') {
      (globalThis as Record<string, unknown>).MutationObserver = class {
        observe() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      };
    }
    const mod = await import('../src/entries/component-registry');
    expect(mod.ComponentRegistry).toBeDefined();
    expect(typeof mod.ComponentRegistry).toBe('function');
  });

  it('sanitize entry exports all utility functions', async () => {
    const mod = await import('../src/entries/sanitize');
    expect(typeof mod.escapeHTML).toBe('function');
    expect(typeof mod.sanitizeHTML).toBe('function');
    expect(typeof mod.isSafeURL).toBe('function');
    expect(typeof mod.sanitizeAttribute).toBe('function');
    expect(typeof mod.createSafeElement).toBe('function');
    expect(typeof mod.setInnerHTML).toBe('function');
  });
});

describe('Dynamic loaders', () => {
  it('loadCarousel resolves with AmphibiousCarousel', async () => {
    const { loadCarousel } = await import('../src/loaders');
    const mod = await loadCarousel();
    expect(mod.AmphibiousCarousel).toBeDefined();
  });

  it('loadModal resolves with Modal', async () => {
    const { loadModal } = await import('../src/loaders');
    const mod = await loadModal();
    expect(mod.Modal).toBeDefined();
    expect(mod.ModalManager).toBeDefined();
  });

  it('loadFormBuilder resolves with FormBuilder', async () => {
    const { loadFormBuilder } = await import('../src/loaders');
    const mod = await loadFormBuilder();
    expect(mod.FormBuilder).toBeDefined();
  });

  it('loadFileUpload resolves with FileUploadEnhanced', async () => {
    const { loadFileUpload } = await import('../src/loaders');
    const mod = await loadFileUpload();
    expect(mod.FileUploadEnhanced).toBeDefined();
  });

  it('loadSearchBar resolves with SearchBarEnhanced', async () => {
    const { loadSearchBar } = await import('../src/loaders');
    const mod = await loadSearchBar();
    expect(mod.SearchBarEnhanced).toBeDefined();
  });

  it('loadDropdown resolves with DropdownEnhanced', async () => {
    const { loadDropdown } = await import('../src/loaders');
    const mod = await loadDropdown();
    expect(mod.DropdownEnhanced).toBeDefined();
  });

  it('loadColorPicker resolves with ColorPicker', async () => {
    const { loadColorPicker } = await import('../src/loaders');
    const mod = await loadColorPicker();
    expect(mod.ColorPicker).toBeDefined();
  });

  it('loadTimeline resolves with Timeline', async () => {
    const { loadTimeline } = await import('../src/loaders');
    const mod = await loadTimeline();
    expect(mod.Timeline).toBeDefined();
  });

  it('loadDatepicker resolves with DatePickerEnhanced', async () => {
    const { loadDatepicker } = await import('../src/loaders');
    const mod = await loadDatepicker();
    expect(mod.DatePickerEnhanced).toBeDefined();
  });

  it('loadRangeSlider resolves with RangeSlider', async () => {
    const { loadRangeSlider } = await import('../src/loaders');
    const mod = await loadRangeSlider();
    expect(mod.RangeSlider).toBeDefined();
  });

  it('loadDataTable resolves with DataTableComponent', async () => {
    const { loadDataTable } = await import('../src/loaders');
    const mod = await loadDataTable();
    expect(mod.DataTableComponent).toBeDefined();
  });

  it('loadToast resolves with ToastComponent', async () => {
    const { loadToast } = await import('../src/loaders');
    const mod = await loadToast();
    expect(mod.ToastComponent).toBeDefined();
  });

  it('loadAccordion resolves with Accordion', async () => {
    const { loadAccordion } = await import('../src/loaders');
    const mod = await loadAccordion();
    expect(mod.Accordion).toBeDefined();
  });

  it('loadTabs resolves with Tabs', async () => {
    const { loadTabs } = await import('../src/loaders');
    const mod = await loadTabs();
    expect(mod.Tabs).toBeDefined();
  });

  it('loadTooltip resolves with Tooltip', async () => {
    const { loadTooltip } = await import('../src/loaders');
    const mod = await loadTooltip();
    expect(mod.Tooltip).toBeDefined();
  });

  it('loadForms resolves with Forms', async () => {
    const { loadForms } = await import('../src/loaders');
    const mod = await loadForms();
    expect(mod.Forms).toBeDefined();
  });

  it('loadSmoothScroll resolves with SmoothScroll', async () => {
    const { loadSmoothScroll } = await import('../src/loaders');
    const mod = await loadSmoothScroll();
    expect(mod.SmoothScroll).toBeDefined();
  });
});
