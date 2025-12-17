/**
 * Amphibious 2.0 - Footer Component
 * A comprehensive footer with newsletter, social links, and site map
 */

import { Icon } from '../js/icons';

export interface FooterOptions {
  newsletter?: boolean;
  social?: string[];
  backToTop?: boolean;
  minimal?: boolean;
  currentYear?: number;
  companyName?: string;
  companyUrl?: string;
  newsletterAction?: string;
  onNewsletterSubmit?: (email: string) => void;
}

export class AmphibiousFooter {
  private element: HTMLElement;
  private options: FooterOptions;
  private backToTopVisible = false;

  constructor(selector: string | HTMLElement, options: FooterOptions = {}) {
    this.element =
      typeof selector === 'string' ? (document.querySelector(selector) as HTMLElement) : selector;

    if (!this.element) {
      throw new Error(`Footer element not found: ${selector}`);
    }

    this.options = {
      newsletter: true,
      social: ['twitter', 'github', 'discord', 'linkedin'],
      backToTop: true,
      minimal: false,
      currentYear: new Date().getFullYear(),
      companyName: 'Amphibious',
      companyUrl: 'https://clivemoore.ca',
      newsletterAction: '/api/newsletter',
      ...options,
    };

    this.init();
  }

  private init(): void {
    if (this.options.minimal) {
      this.renderMinimal();
    } else {
      this.renderFull();
    }
    this.attachEventListeners();
    this.initializeIcons();

    if (this.options.backToTop) {
      this.initBackToTop();
    }
  }

  private renderFull(): void {
    const footer = document.createElement('footer');
    footer.className = 'amp-footer';
    footer.setAttribute('role', 'contentinfo');

    footer.innerHTML = `
      <div class="amp-footer__main">
        <div class="container">
          <div class="row">
            <!-- Product Column -->
            <div class="col-4 col-tablet-8 col-mobile-16">
              <div class="amp-footer__section">
                <h4 class="amp-footer__title">Product</h4>
                <ul class="amp-footer__links">
                  <li><a href="/">Features</a></li>
                  <li><a href="/docs/getting-started.html">Installation</a></li>
                  <li><a href="/examples/">Examples</a></li>
                  <li><a href="/showcase/">Showcase</a></li>
                  <li><a href="/playground/">Playground</a></li>
                  <li><a href="#roadmap">Roadmap</a></li>
                </ul>
              </div>
            </div>

            <!-- Resources Column -->
            <div class="col-4 col-tablet-8 col-mobile-16">
              <div class="amp-footer__section">
                <h4 class="amp-footer__title">Resources</h4>
                <ul class="amp-footer__links">
                  <li><a href="/docs/">Documentation</a></li>
                  <li><a href="/docs/components/">Components</a></li>
                  <li><a href="/docs/grid-system.html">Grid System</a></li>
                  <li><a href="/docs/api-reference.html">API Reference</a></li>
                  <li><a href="/docs/typescript.html">TypeScript</a></li>
                  <li><a href="/support">Support</a></li>
                </ul>
              </div>
            </div>

            <!-- Community Column -->
            <div class="col-4 col-tablet-8 col-mobile-16">
              <div class="amp-footer__section">
                <h4 class="amp-footer__title">Community</h4>
                <ul class="amp-footer__links">
                  <li>
                    <a href="https://github.com/your-org/amphibious" target="_blank" rel="noopener">
                      <i data-lucide="github" class="icon--xs"></i> GitHub
                    </a>
                  </li>
                  <li>
                    <a href="https://discord.gg/amphibious" target="_blank" rel="noopener">
                      <i data-lucide="message-circle" class="icon--xs"></i> Discord
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com/amphibious" target="_blank" rel="noopener">
                      <i data-lucide="twitter" class="icon--xs"></i> Twitter
                    </a>
                  </li>
                  <li>
                    <a href="/blog">
                      <i data-lucide="file-text" class="icon--xs"></i> Blog
                    </a>
                  </li>
                  <li>
                    <a href="/forum">
                      <i data-lucide="users" class="icon--xs"></i> Forum
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Newsletter Column -->
            <div class="col-4 col-tablet-8 col-mobile-16">
              <div class="amp-footer__section">
                ${this.options.newsletter ? this.renderNewsletter() : this.renderCompany()}
              </div>
            </div>
          </div>

          ${this.options.newsletter ? '' : this.renderNewsletterRow()}
        </div>
      </div>

      <div class="amp-footer__bottom">
        <div class="container">
          <div class="amp-footer__bottom-content">
            <div class="amp-footer__copyright">
              <p>© ${this.options.currentYear} ${this.options.companyName}. All rights reserved.</p>
              <p class="amp-footer__built">
                Built with ❤️ by <a href="${this.options.companyUrl}" target="_blank" rel="noopener">Clive Moore</a>
                | Part of the <a href="https://github.com/your-org/AIAB" target="_blank" rel="noopener">Agency In A Box</a> ecosystem
              </p>
            </div>

            <div class="amp-footer__legal">
              <a href="/privacy">Privacy Policy</a>
              <span class="amp-footer__separator">•</span>
              <a href="/terms">Terms of Service</a>
              <span class="amp-footer__separator">•</span>
              <a href="/cookies">Cookie Policy</a>
            </div>

            ${this.renderSocialLinks()}
          </div>
        </div>
      </div>

      ${this.options.backToTop ? this.renderBackToTop() : ''}
    `;

    // Replace existing element content
    this.element.innerHTML = '';
    this.element.appendChild(footer);
  }

  private renderMinimal(): void {
    const footer = document.createElement('footer');
    footer.className = 'amp-footer amp-footer--minimal';
    footer.setAttribute('role', 'contentinfo');

    footer.innerHTML = `
      <div class="container">
        <div class="amp-footer__minimal-content">
          <div class="amp-footer__brand">
            <a href="/" class="amp-footer__logo">
              <span>🐸</span> Amphibious 2.0
            </a>
            <p>© ${this.options.currentYear} ${this.options.companyName}. All rights reserved.</p>
          </div>

          <nav class="amp-footer__nav" aria-label="Footer navigation">
            <a href="/docs/">Docs</a>
            <a href="/examples/">Examples</a>
            <a href="https://github.com/your-org/amphibious" target="_blank" rel="noopener">GitHub</a>
            <a href="/support">Support</a>
          </nav>

          ${this.renderSocialLinks()}
        </div>
      </div>

      ${this.options.backToTop ? this.renderBackToTop() : ''}
    `;

    // Replace existing element content
    this.element.innerHTML = '';
    this.element.appendChild(footer);
  }

  private renderNewsletter(): string {
    return `
      <h4 class="amp-footer__title">Stay Updated</h4>
      <p class="amp-footer__description">
        Get the latest updates, tips, and resources delivered to your inbox.
      </p>
      <form class="amp-footer__newsletter" id="newsletterForm">
        <div class="amp-footer__newsletter-input-group">
          <input
            type="email"
            class="amp-footer__newsletter-input"
            placeholder="Enter your email"
            required
            aria-label="Email address"
          >
          <button type="submit" class="amp-footer__newsletter-button">
            Subscribe
            <i data-lucide="arrow-right" class="icon--sm"></i>
          </button>
        </div>
        <p class="amp-footer__newsletter-note">
          <i data-lucide="lock" class="icon--xs"></i>
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    `;
  }

  private renderNewsletterRow(): string {
    if (!this.options.newsletter) return '';

    return `
      <div class="amp-footer__newsletter-row">
        <div class="row">
          <div class="col-16">
            <div class="amp-footer__newsletter-horizontal">
              <div class="amp-footer__newsletter-content">
                <h3>Subscribe to our newsletter</h3>
                <p>Get the latest updates and releases</p>
              </div>
              <form class="amp-footer__newsletter-form" id="newsletterFormHorizontal">
                <input
                  type="email"
                  class="amp-footer__newsletter-input"
                  placeholder="Enter your email"
                  required
                  aria-label="Email address"
                >
                <button type="submit" class="amp-footer__newsletter-button">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderCompany(): string {
    return `
      <h4 class="amp-footer__title">Company</h4>
      <ul class="amp-footer__links">
        <li><a href="/about">About Us</a></li>
        <li><a href="/team">Team</a></li>
        <li><a href="/careers">Careers</a></li>
        <li><a href="/press">Press Kit</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/partners">Partners</a></li>
      </ul>
    `;
  }

  private renderSocialLinks(): string {
    if (!this.options.social || this.options.social.length === 0) return '';

    const socialIcons: Record<string, string> = {
      twitter: 'twitter',
      github: 'github',
      discord: 'message-circle',
      linkedin: 'linkedin',
      facebook: 'facebook',
      instagram: 'instagram',
      youtube: 'youtube',
      twitch: 'twitch',
    };

    const socialUrls: Record<string, string> = {
      twitter: 'https://twitter.com/amphibious',
      github: 'https://github.com/your-org/amphibious',
      discord: 'https://discord.gg/amphibious',
      linkedin: 'https://linkedin.com/company/amphibious',
      facebook: 'https://facebook.com/amphibious',
      instagram: 'https://instagram.com/amphibious',
      youtube: 'https://youtube.com/amphibious',
      twitch: 'https://twitch.tv/amphibious',
    };

    return `
      <div class="amp-footer__social">
        ${this.options.social
          .map(
            (platform) => `
          <a
            href="${socialUrls[platform] || '#'}"
            class="amp-footer__social-link"
            target="_blank"
            rel="noopener"
            aria-label="${platform}"
            data-tooltip="${platform.charAt(0).toUpperCase() + platform.slice(1)}"
          >
            <i data-lucide="${socialIcons[platform] || 'link'}"></i>
          </a>
        `,
          )
          .join('')}
      </div>
    `;
  }

  private renderBackToTop(): string {
    return `
      <button
        class="amp-footer__back-to-top"
        id="backToTop"
        aria-label="Back to top"
        data-tooltip="Back to top"
      >
        <i data-lucide="arrow-up"></i>
      </button>
    `;
  }

  private attachEventListeners(): void {
    // Newsletter form submissions
    const forms = this.element.querySelectorAll('[id^="newsletterForm"]');
    forms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = (form as HTMLFormElement).querySelector(
          'input[type="email"]',
        ) as HTMLInputElement;
        if (input && input.value) {
          this.handleNewsletterSubmit(input.value);
          input.value = '';
        }
      });
    });

    // Back to top
    if (this.options.backToTop) {
      const backToTopBtn = this.element.querySelector('#backToTop') as HTMLButtonElement;
      if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        });
      }
    }
  }

  private initBackToTop(): void {
    const backToTopBtn = this.element.querySelector('#backToTop') as HTMLButtonElement;
    if (!backToTopBtn) return;

    const scrollThreshold = 300;
    let ticking = false;

    const updateBackToTop = () => {
      const shouldShow = window.scrollY > scrollThreshold;

      if (shouldShow && !this.backToTopVisible) {
        this.backToTopVisible = true;
        backToTopBtn.classList.add('amp-footer__back-to-top--visible');
      } else if (!shouldShow && this.backToTopVisible) {
        this.backToTopVisible = false;
        backToTopBtn.classList.remove('amp-footer__back-to-top--visible');
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateBackToTop);
        ticking = true;
      }
    });
  }

  private handleNewsletterSubmit(email: string): void {
    if (this.options.onNewsletterSubmit) {
      this.options.onNewsletterSubmit(email);
    } else {
      // Default behavior - show success message
      const forms = this.element.querySelectorAll('[id^="newsletterForm"]');
      forms.forEach((form) => {
        const originalContent = form.innerHTML;
        form.innerHTML = `
          <div class="amp-footer__newsletter-success">
            <i data-lucide="check-circle" class="icon--success"></i>
            <p>Thank you for subscribing!</p>
          </div>
        `;

        // Reset after 3 seconds
        setTimeout(() => {
          form.innerHTML = originalContent;
          this.initializeIcons();
        }, 3000);
      });
    }

    // In production, this would send to the API
    if (this.options.newsletterAction) {
      fetch(this.options.newsletterAction, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).catch((error) => {
        console.error('Newsletter subscription error:', error);
      });
    }
  }

  private initializeIcons(): void {
    setTimeout(() => {
      Icon.init();
    }, 10);
  }

  public destroy(): void {
    this.element.innerHTML = '';
  }
}

// Export factory function
export function createFooter(
  selector: string | HTMLElement,
  options?: FooterOptions,
): AmphibiousFooter {
  return new AmphibiousFooter(selector, options);
}
