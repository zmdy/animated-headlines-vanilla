/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Progress: counts a number up (or down) to its target with an ease-out that
 * lands softly without overshooting, optionally drawing a bar underneath that
 * fills at the same pace.
 *
 * It plays once when it scrolls into view (`trigger="view"`, the default), on
 * load (`trigger="load"`), or when `play()` is called (`trigger="manual"`).
 * Changing `to` afterwards counts on from wherever the number currently is.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {emit, prefersReducedMotion} from './utilities';

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export default class AnimatedProgressElement extends HTMLElement {
    static get observedAttributes() {
        return ['from', 'to', 'decimals', 'prefix', 'suffix', 'locale', 'bar'];
    }

    private value = 0;
    private frame: number | undefined;
    private observer: IntersectionObserver | undefined;
    private played = false;

    private valueElement!: HTMLElement;
    private prefixElement!: HTMLElement;
    private suffixElement!: HTMLElement;
    private barElement: HTMLElement | null = null;

    connectedCallback() {
        this.build();
        this.value = this.number('from', 0);
        this.paint(this.value);

        const trigger = this.getAttribute('trigger') ?? 'view';
        if (trigger === 'load' || (trigger === 'view' && ! ('IntersectionObserver' in window))) {
            this.play();
        } else if (trigger === 'view') {
            this.observer = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) {
                    this.observer?.disconnect();
                    this.play();
                }
            }, {threshold: 0.4});
            this.observer.observe(this);
        }

        emit(this, 'ready');
    }

    disconnectedCallback() {
        cancelAnimationFrame(this.frame!);
        this.observer?.disconnect();
    }

    attributeChangedCallback(name: string) {
        if (! this.isConnected || this.valueElement === undefined) {
            return;
        }

        if (name === 'bar') {
            this.build();
        }

        if (name === 'to' && this.played) {
            // count on from the current position
            this.run(this.value, this.number('to', 100));
        } else {
            this.paint(this.value);
        }
    }

    /** @api count from `from` to `to` (again, if it already ran) */
    public play(): void {
        this.played = true;
        this.run(this.number('from', 0), this.number('to', 100));
    }

    private number(name: string, fallback: number): number {
        const parsed = parseFloat(this.getAttribute(name) ?? '');

        return Number.isFinite(parsed) ? parsed : fallback;
    }

    private build(): void {
        const hasBar = this.hasAttribute('bar') && this.getAttribute('bar') !== 'false';

        if (this.valueElement === undefined) {
            this.textContent = '';

            this.prefixElement = document.createElement('span');
            this.prefixElement.className = 'ah-affix';
            this.valueElement = document.createElement('span');
            this.valueElement.className = 'ah-value';
            this.suffixElement = document.createElement('span');
            this.suffixElement.className = 'ah-affix';

            const text = document.createElement('span');
            text.className = 'ah-text';
            text.setAttribute('aria-hidden', 'true');
            text.append(this.prefixElement, this.valueElement, this.suffixElement);
            this.appendChild(text);
        }

        if (hasBar && this.barElement === null) {
            this.barElement = document.createElement('span');
            this.barElement.className = 'ah-bar';
            this.barElement.setAttribute('aria-hidden', 'true');
            this.barElement.appendChild(document.createElement('i'));
            this.appendChild(this.barElement);
        } else if (! hasBar && this.barElement !== null) {
            this.barElement.remove();
            this.barElement = null;
        }
    }

    private run(from: number, to: number): void {
        cancelAnimationFrame(this.frame!);
        this.classList.remove('is-landed');

        const duration = Math.max(0, this.number('duration', 1800));

        if (prefersReducedMotion() || duration === 0 || from === to) {
            return this.land(to);
        }

        const start = performance.now();
        const step = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            this.paint(from + (to - from) * easeOutCubic(progress));

            if (progress < 1) {
                this.frame = requestAnimationFrame(step);
            } else {
                this.land(to);
            }
        };

        this.frame = requestAnimationFrame(step);
    }

    private land(to: number): void {
        this.paint(to);
        this.classList.add('is-landed');
        emit(this, 'complete', {value: to});
    }

    private paint(value: number): void {
        this.value = value;

        const decimals = Math.max(0, Math.round(this.number('decimals', 0)));
        this.prefixElement.textContent = this.getAttribute('prefix') ?? '';
        this.valueElement.textContent = this.format(value, decimals);
        this.suffixElement.textContent = this.getAttribute('suffix') ?? '';

        // The final figure is what assistive technology should hear, not
        // every step on the way there.
        this.setAttribute('aria-label', (this.getAttribute('prefix') ?? '') + this.format(this.number('to', 100), decimals) + (this.getAttribute('suffix') ?? ''));

        const from = this.number('from', 0);
        const to = this.number('to', 100);
        const ratio = to === from ? 1 : (value - from) / (to - from);
        this.style.setProperty('--ah-progress', Math.min(1, Math.max(0, ratio)).toFixed(4));
    }

    private format(value: number, decimals: number): string {
        try {
            return new Intl.NumberFormat(this.getAttribute('locale') || undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            }).format(value);
        } catch {
            return value.toFixed(decimals);
        }
    }
}
customElements.define('via-animated-progress', AnimatedProgressElement);
