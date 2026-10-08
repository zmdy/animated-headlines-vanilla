/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Shared base of the counter family (clock, countdown, timecode): the value
 * is shown as one slot per character, and when the value changes only the
 * slots whose character actually changed roll. The rolling itself lives in
 * RollingText, which the progress counter uses as well.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {RollingText} from './rolling-text';
import {emit} from './utilities';

export function pad(value: number, length = 2): string {
    return String(Math.max(0, Math.floor(value))).padStart(length, '0');
}

export abstract class AnimatedCounterElement extends HTMLElement {
    private digits = new RollingText(this);
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
        this.digits.write(text, instantFrom);
        this.announce(Array.from(text).slice(0, instantFrom).join(''));
    }

    private announce(label: string): void {
        label = label.replace(/[:.\s]+$/, '');

        if (label !== this.label) {
            this.label = label;
            this.setAttribute('aria-label', label);
        }
    }
}
