/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Shared base of the counter family (clock, countdown, timecode): the value
 * is shown as one slot per character, and when the value changes only the
 * slots whose character actually changed roll - the new glyph rises in from
 * below while the old one lifts out through the top.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {emit, prefersReducedMotion} from './utilities';

/** If `animationend` never arrives (hidden tab, `display: none`) the old glyph is dropped anyway. */
const ROLL_FALLBACK = 700;

export function pad(value: number, length = 2): string {
    return String(Math.max(0, Math.floor(value))).padStart(length, '0');
}

export abstract class AnimatedCounterElement extends HTMLElement {
    private shown: string[] = [];
    private label = '';
    protected timer: number | undefined;

    connectedCallback() {
        this.setAttribute('role', 'timer');
        this.setAttribute('aria-live', 'off');
        this.begin();
        emit(this, 'ready');
    }

    disconnectedCallback() {
        this.end();
    }

    attributeChangedCallback(_name?: string) {
        if (this.isConnected) {
            this.end();
            this.begin();
        }
    }

    /** Start (or restart) ticking. */
    protected abstract begin(): void;

    /** Stop ticking and release timers. */
    protected end(): void {
        window.clearTimeout(this.timer);
        this.timer = undefined;
    }

    /**
     * Write `text` into the slots.
     *
     * Characters from index `instantFrom` on are swapped without rolling -
     * meant for values that change too fast to be read as motion, such as the
     * frames of a timecode.
     */
    protected display(text: string, instantFrom = Infinity): void {
        const chars = Array.from(text);

        if (chars.length !== this.shown.length) {
            this.rebuild(chars);
        } else {
            const animate = ! prefersReducedMotion();

            chars.forEach((char, index) => {
                if (char === this.shown[index]) {
                    return;
                }

                const slot = this.children[index] as HTMLElement;
                this.classify(slot, char);

                if (animate && index < instantFrom) {
                    this.roll(slot, char);
                } else {
                    slot.textContent = char;
                }
            });
        }

        this.shown = chars;
        this.announce(chars.slice(0, instantFrom).join(''));
    }

    private rebuild(chars: string[]): void {
        this.textContent = '';

        chars.forEach(char => {
            const slot = document.createElement('span');
            slot.setAttribute('aria-hidden', 'true');
            this.classify(slot, char);
            slot.textContent = char;
            this.appendChild(slot);
        });
    }

    private classify(slot: HTMLElement, char: string): void {
        slot.className = 'ah-char ' + (/\d/.test(char) ? 'is-digit' : /\s/.test(char) ? 'is-space' : /[:.,]/.test(char) ? 'is-sep' : 'is-text');
    }

    private roll(slot: HTMLElement, next: string): void {
        // A roll still in flight is cut short rather than stacked.
        while (slot.childNodes.length > 1) {
            slot.removeChild(slot.firstChild!);
        }

        const old = document.createElement('span');
        old.className = 'ah-face is-out';
        old.textContent = slot.textContent;

        const face = document.createElement('span');
        face.className = 'ah-face is-in';
        face.textContent = next;

        slot.textContent = '';
        slot.append(old, face);

        const drop = () => old.remove();
        old.addEventListener('animationend', drop, {once: true});
        window.setTimeout(drop, ROLL_FALLBACK);
    }

    private announce(label: string): void {
        label = label.replace(/[:.\s]+$/, '');

        if (label !== this.label) {
            this.label = label;
            this.setAttribute('aria-label', label);
        }
    }
}
