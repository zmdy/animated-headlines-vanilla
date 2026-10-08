/**
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

import {RollingText} from './rolling-text';
import {emit, flagAttribute, numberAttribute, prefersReducedMotion} from './utilities';

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/**
 * How often the rolling figure is allowed to change, in milliseconds.
 *
 * Counting repaints every frame, which is far too fast for a roll to be seen
 * as motion - the digits would only blur. At this cadence each change is a
 * legible flip, and the figure still lands exactly on its target because the
 * final paint is not throttled.
 */
const ROLL_CADENCE = 80;

export default class AnimatedProgressElement extends HTMLElement {
    static get observedAttributes() {
        return ['from', 'to', 'decimals', 'prefix', 'suffix', 'locale', 'bar', 'roll'];
    }

    private value = 0;
    private frame: number | undefined;
    private observer: IntersectionObserver | undefined;
    private played = false;

    private digits: RollingText | undefined;
    private painted = 0;

    private valueElement!: HTMLElement;
    private prefixElement!: HTMLElement;
    private suffixElement!: HTMLElement;
    private barElement: HTMLElement | null = null;

    connectedCallback() {
        this.build();
        this.value = numberAttribute(this, 'from', 0);
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
            this.run(this.value, numberAttribute(this, 'to', 100));
        } else {
            this.paint(this.value);
        }
    }

    /** @api count from `from` to `to` (again, if it already ran) */
    public play(): void {
        this.played = true;
        this.run(numberAttribute(this, 'from', 0), numberAttribute(this, 'to', 100));
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

        // `roll` is read here rather than at every paint, so turning it on or
        // off swaps the figure once instead of each frame.
        const rolling = flagAttribute(this, 'roll', false);
        if (rolling && this.digits === undefined) {
            this.digits = new RollingText(this.valueElement);
            this.valueElement.textContent = '';
        } else if (! rolling && this.digits !== undefined) {
            this.digits = undefined;
            this.valueElement.textContent = '';
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

        // A figure on its way down rolls down, unless the author chose.
        if (! this.hasAttribute('direction')) {
            this.style.setProperty('--ah-roll-in', to < from ? 'ah-digit-in-down' : 'ah-digit-in');
            this.style.setProperty('--ah-roll-out', to < from ? 'ah-digit-out-down' : 'ah-digit-out');
        }

        const duration = Math.max(0, numberAttribute(this, 'duration', 1800));

        if (prefersReducedMotion() || duration === 0 || from === to) {
            return this.land(to);
        }

        const start = performance.now();
        this.painted = 0;
        const step = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);

            if (! this.digits || now - this.painted >= ROLL_CADENCE) {
                this.painted = now;
                this.paint(from + (to - from) * easeOutCubic(progress));
            }

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

        const decimals = Math.max(0, Math.round(numberAttribute(this, 'decimals', 0)));
        this.prefixElement.textContent = this.getAttribute('prefix') ?? '';
        if (this.digits) {
            this.digits.write(this.format(value, decimals));
        } else {
            this.valueElement.textContent = this.format(value, decimals);
        }
        this.suffixElement.textContent = this.getAttribute('suffix') ?? '';

        // The final figure is what assistive technology should hear, not
        // every step on the way there.
        this.setAttribute('aria-label', (this.getAttribute('prefix') ?? '') + this.format(numberAttribute(this, 'to', 100), decimals) + (this.getAttribute('suffix') ?? ''));

        const from = numberAttribute(this, 'from', 0);
        const to = numberAttribute(this, 'to', 100);
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
