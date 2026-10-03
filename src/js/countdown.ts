/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Countdown to a moment in time. Rolls only the digits that changed, stops at
 * zero (never goes negative) and announces itself with `complete`.
 *
 * Formats: `labeled` (12d 03h 45m 12s), `compact` (12:03:45:12) and `minimal`
 * (compact, but the days drop out once they reach zero).
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {AnimatedCounterElement, pad} from './counter';
import {emit} from './utilities';

export default class AnimatedCountdownElement extends AnimatedCounterElement {
    static get observedAttributes() {
        return ['target', 'format'];
    }

    private completed = false;

    protected begin(): void {
        this.completed = false;
        this.removeAttribute('complete');
        this.tick();
    }

    private target(): number {
        const raw = this.getAttribute('target') ?? '';
        // numbers are epoch milliseconds, everything else goes through Date
        return /^\d+$/.test(raw) ? parseInt(raw) : Date.parse(raw);
    }

    private tick(): void {
        const target = this.target();
        if (Number.isNaN(target)) {
            console.warn('via-animated-countdown needs a valid "target" date');
            this.display(this.format(0));
            return;
        }

        const remaining = Math.max(0, target - Date.now());
        const seconds = Math.ceil(remaining / 1000);

        this.display(this.format(seconds));
        emit(this, 'tick', {remaining: seconds});

        if (remaining === 0) {
            this.completed = true;
            this.setAttribute('complete', '');
            emit(this, 'complete');
            return;
        }

        // Next change is when the remaining time crosses the next whole second.
        this.timer = window.setTimeout(() => this.tick(), remaining - (seconds - 1) * 1000 + 4);
    }

    private format(total: number): string {
        const days = Math.floor(total / 86400);
        const hours = Math.floor(total / 3600) % 24;
        const minutes = Math.floor(total / 60) % 60;
        const seconds = total % 60;

        switch (this.getAttribute('format')) {
            case 'labeled':
                return `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
            case 'minimal':
                if (days === 0) {
                    return [hours, minutes, seconds].map(n => pad(n)).join(':');
                }
            // fall through: with days left, minimal is the compact notation
            default:
                return [days, hours, minutes, seconds].map(n => pad(n)).join(':');
        }
    }
}
customElements.define('via-animated-countdown', AnimatedCountdownElement);
