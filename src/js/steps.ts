/**
 * Steps Module - Amphibious 2.0
 * Enhances `.aiab-steps` markup (see organisms/steps.css): tracks the active
 * step, marks earlier steps complete and optionally lets users click a step.
 */

export interface StepsOptions {
  /** Zero-based index of the active step. Defaults to the item marked `--active`, else 0. */
  currentStep?: number;
  /** Let users click a step to go to it. Default false. */
  allowClick?: boolean;
  /** Called with the zero-based index after the active step changes. */
  onStepChange?: (stepIndex: number) => void;
}

const ITEM = '.aiab-steps__item';
const ACTIVE = 'aiab-steps__item--active';
const COMPLETE = 'aiab-steps__item--complete';

export class Steps {
  private static instances = new WeakMap<HTMLElement, Steps>();

  readonly element: HTMLElement;
  private readonly options: StepsOptions;
  private items: HTMLElement[];
  private current = 0;
  private listeners: Array<{ el: Element; type: string; handler: EventListener }> = [];

  /** @throws If the element or selector is not found. */
  constructor(element: string | HTMLElement, options: StepsOptions = {}) {
    const root =
      typeof element === 'string' ? document.querySelector<HTMLElement>(element) : element;
    if (!root) throw new Error(`[Amphibious] Steps element not found: ${String(element)}`);

    Steps.instances.get(root)?.destroy();
    this.element = root;
    this.options = options;
    this.items = Array.from(root.querySelectorAll<HTMLElement>(ITEM));

    const marked = this.items.findIndex((item) => item.classList.contains(ACTIVE));
    this.render(options.currentStep ?? (marked >= 0 ? marked : 0));
    if (options.allowClick) this.bindClicks();
    Steps.instances.set(root, this);
  }

  /** The instance attached to `element`, if any. */
  static getInstance(element: HTMLElement): Steps | undefined {
    return Steps.instances.get(element);
  }

  /** Zero-based index of the active step. */
  get currentStep(): number {
    return this.current;
  }

  get totalSteps(): number {
    return this.items.length;
  }

  /** Make step `index` active; earlier steps become complete, later ones pending. */
  goToStep(index: number): void {
    if (index < 0 || index >= this.items.length) return;
    const changed = index !== this.current;
    this.render(index);
    if (changed) this.options.onStepChange?.(index);
  }

  next(): void {
    this.goToStep(this.current + 1);
  }

  previous(): void {
    this.goToStep(this.current - 1);
  }

  /** Mark step `index` complete without moving the active step. */
  completeStep(index: number): void {
    const item = this.items[index];
    if (!item || index === this.current) return;
    item.classList.add(COMPLETE);
  }

  destroy(): void {
    for (const { el, type, handler } of this.listeners) el.removeEventListener(type, handler);
    this.listeners = [];
    if (Steps.instances.get(this.element) === this) Steps.instances.delete(this.element);
  }

  private render(index: number): void {
    this.current = Math.min(Math.max(index, 0), Math.max(this.items.length - 1, 0));
    this.items.forEach((item, i) => {
      item.classList.toggle(ACTIVE, i === this.current);
      item.classList.toggle(COMPLETE, i < this.current);
      if (i === this.current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
  }

  private bindClicks(): void {
    this.items.forEach((item, index) => {
      item.setAttribute('role', 'button');
      item.tabIndex = 0;
      const go = () => this.goToStep(index);
      const onKey = (event: Event) => {
        const key = (event as KeyboardEvent).key;
        if (key === 'Enter' || key === ' ') {
          event.preventDefault();
          go();
        }
      };
      item.addEventListener('click', go);
      item.addEventListener('keydown', onKey);
      this.listeners.push(
        { el: item, type: 'click', handler: go },
        { el: item, type: 'keydown', handler: onKey },
      );
    });
  }
}

export default Steps;
