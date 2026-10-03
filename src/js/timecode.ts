/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Timecode: a running SMPTE-style counter (HH:MM:SS:FF) that ticks in frames.
 * Hours, minutes and seconds roll; the frame digits change too fast to be read
 * as motion, so they simply flip.
 *
 * Driven by `requestAnimationFrame` and the clock, not by an interval, so it
 * stays frame-accurate and does not drift.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {AnimatedCounterElement, pad} from './counter';
import {emit, numberAttribute, prefersReducedMotion} from './utilities';

const DAY = 24 * 3600;

export default class AnimatedTimecodeElement extends AnimatedCounterElement {
    static get observedAttributes() {
        return ['start', 'fps', 'format', 'paused'];
    }

    private fps = 30;
    /** Frames that had already been counted when the clock was last (re)started. */
    private base = 0;
    private since = 0;
    private frame: number | undefined;
    private lastSecond = -1;
    private lastTotal = -1;

    /** @api jump back to the start value */
    public reset(): void {
        this.end();
        this.begin();
    }

    protected begin(): void {
        this.fps = Math.max(1, Math.round(numberAttribute(this, 'fps', 30)));
        this.base = this.parse(this.getAttribute('start') ?? '');
        this.since = performance.now();
        this.lastSecond = -1;
        this.lastTotal = -1;

        this.render();

        if (! this.hasAttribute('paused') && ! prefersReducedMotion()) {
            this.frame = requestAnimationFrame(() => this.loop());
        }
    }

    protected end(): void {
        super.end();
        cancelAnimationFrame(this.frame!);
        this.frame = undefined;
    }

    attributeChangedCallback(name?: string) {
        // Pausing and resuming keeps the count; any other change restarts it.
        if (name !== 'paused' || ! this.isConnected) {
            return super.attributeChangedCallback(name);
        }

        if (this.hasAttribute('paused')) {
            this.base = this.frames();
            this.end();
        } else {
            this.since = performance.now();
            this.frame = requestAnimationFrame(() => this.loop());
        }
    }

    private loop(): void {
        this.render();
        this.frame = requestAnimationFrame(() => this.loop());
    }

    private frames(): number {
        const running = this.frame === undefined ? 0 : (performance.now() - this.since) / 1000 * this.fps;

        return this.base + Math.floor(running);
    }

    private render(): void {
        const total = this.frames();

        // The screen refreshes faster than most frame rates: skip the repeats.
        if (total === this.lastTotal) {
            return;
        }
        this.lastTotal = total;

        const second = Math.floor(total / this.fps) % DAY;
        const full = this.getAttribute('format') !== 'compact';

        const clock = [second / 3600, (second / 60) % 60, second % 60].map(n => pad(n)).join(':');

        if (full) {
            this.display(clock + ':' + pad(total % this.fps), clock.length);
        } else {
            this.display(clock);
        }

        if (second !== this.lastSecond) {
            this.lastSecond = second;
            emit(this, 'tick', {second});
        }
    }

    /** "HH:MM:SS:FF" or "HH:MM:SS" to frames. */
    private parse(value: string): number {
        const groups = value.split(':').map(n => parseInt(n)).filter(n => Number.isFinite(n));
        if (groups.length === 0) {
            return 0;
        }

        // Missing trailing groups count as zero.
        const [h = 0, m = 0, s = 0, f = 0] = groups.length >= 4 ? groups : [...groups, ...Array(4 - groups.length).fill(0)];

        return ((h * 3600 + m * 60 + s) * this.fps + f) % (DAY * this.fps);
    }
}
customElements.define('via-animated-timecode', AnimatedTimecodeElement);
