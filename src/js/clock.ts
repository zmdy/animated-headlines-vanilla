/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Clock: the current time, in any IANA time zone, in 12 or 24 hour notation.
 * Only the digits that moved roll; the separators breathe on their own beat.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {AnimatedCounterElement, pad} from './counter';
import {emit, flagAttribute} from './utilities';

export default class AnimatedClockElement extends AnimatedCounterElement {
    static get observedAttributes() {
        return ['timezone', 'format', 'seconds'];
    }

    private formatter!: Intl.DateTimeFormat;

    protected begin(): void {
        const twelve = this.getAttribute('format') === '12h';
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: twelve ? 'h12' : 'h23',
        };

        try {
            this.formatter = new Intl.DateTimeFormat('en-US', {...options, timeZone: this.getAttribute('timezone') || undefined});
        } catch {
            console.warn('invalid time zone "' + this.getAttribute('timezone') + '", using the local one');
            this.formatter = new Intl.DateTimeFormat('en-US', options);
        }

        this.tick();
    }

    private tick(): void {
        const now = new Date();

        this.display(this.format(now));
        emit(this, 'tick', {date: now});

        // Wake up right after the next full second, so the digits turn on the
        // beat of the wall clock instead of drifting against it.
        this.timer = window.setTimeout(() => this.tick(), 1000 - now.getMilliseconds() + 4);
    }

    private format(date: Date): string {
        const parts: Record<string, string> = {};
        this.formatter.formatToParts(date).forEach(part => parts[part.type] = part.value);

        // Some engines render midnight as "24" in h23 mode.
        const hour = parts.hour === '24' ? pad(0) : parts.hour;

        let text = hour + ':' + parts.minute;
        if (flagAttribute(this, 'seconds', true)) {
            text += ':' + parts.second;
        }
        if (this.getAttribute('format') === '12h') {
            text += ' ' + parts.dayPeriod;
        }

        return text;
    }
}
customElements.define('via-animated-clock', AnimatedClockElement);
