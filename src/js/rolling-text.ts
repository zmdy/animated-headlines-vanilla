/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Text shown as one slot per character, where only the slots whose character
 * actually changed move: the new glyph rolls in while the old one rolls out.
 *
 * It is written as a helper around a host element rather than a base class,
 * because the counters are the host themselves (clock, countdown, timecode)
 * while the progress counter rolls only the figure inside its own prefix and
 * suffix - one implementation either way.
 *
 * Which way a glyph travels is the host's business, and CSS reads it from the
 * `direction` attribute: up by default, down for a value on its way to zero.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {prefersReducedMotion} from './utilities';

/** If `animationend` never arrives (hidden tab, `display: none`) the old glyph is dropped anyway. */
const ROLL_FALLBACK = 700;

export class RollingText {
    private shown: string[] = [];

    constructor(private readonly host: HTMLElement) {
    }

    /** The characters currently on screen. */
    public get text(): string {
        return this.shown.join('');
    }

    /**
     * Write `text` into the slots.
     *
     * Characters from index `instantFrom` on are swapped without rolling -
     * meant for values that change too fast to be read as motion, such as the
     * frames of a timecode.
     */
    public write(text: string, instantFrom = Infinity): void {
        const chars = Array.from(text);

        // A different number of characters is a different row of slots, so
        // there is nothing to roll from: it is built fresh.
        if (chars.length !== this.shown.length) {
            this.rebuild(chars);
            this.shown = chars;
            return;
        }

        const animate = ! prefersReducedMotion();

        chars.forEach((char, index) => {
            if (char === this.shown[index]) {
                return;
            }

            const slot = this.host.children[index] as HTMLElement;
            this.classify(slot, char);

            if (animate && index < instantFrom) {
                this.roll(slot, char);
            } else {
                slot.textContent = char;
            }
        });

        this.shown = chars;
    }

    /** Forget what is on screen, so the next write builds from nothing. */
    public clear(): void {
        this.shown = [];
        this.host.textContent = '';
    }

    private rebuild(chars: string[]): void {
        this.host.textContent = '';

        chars.forEach(char => {
            const slot = document.createElement('span');
            slot.setAttribute('aria-hidden', 'true');
            this.classify(slot, char);
            slot.textContent = char;
            this.host.appendChild(slot);
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
}
