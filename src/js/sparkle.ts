/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Sparkles: the phrase arrives with a scatter of four-pointed twinkles that
 * pop in and out around it.
 *
 * The positions, sizes and offsets are rolled once, when the element is set
 * up, and handed to CSS as inline values - so the twinkling itself costs no
 * JavaScript at all.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedWordsElement from './words';
import {numberAttribute} from './utilities';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** An original four-pointed twinkle, drawn in a 24x24 box. */
const SPARKLE_PATH = 'M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z';

const DEFAULT_COUNT = 7;

function between(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

export default class SparkleAnimatedWordsElement extends AnimatedWordsElement {
    protected readonly sparkleClassName = 'sparkle';

    connectedCallback() {
        const count = numberAttribute(this, 'sparkles', DEFAULT_COUNT);

        this.querySelectorAll(this.wordSelector).forEach(word => this.scatter(word as HTMLElement, count));

        super.connectedCallback();
    }

    private scatter(word: HTMLElement, count: number): void {
        // The host re-renders once per observed attribute and clones its
        // children each time, so without this the twinkles would pile up on
        // every pass.
        if (word.querySelector('.' + this.sparkleClassName) !== null) {
            return;
        }

        for (let i = 0; i < count; i++) {
            word.appendChild(this.sparkle(i, count));
        }
    }

    private sparkle(index: number, count: number): SVGElement {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('class', this.sparkleClassName);

        const size = between(9, 19);

        // Spread the twinkles along the phrase rather than clustering them, and
        // stagger their cycles so they never all flash at once.
        const column = (index + between(0.15, 0.85)) / count;

        svg.style.setProperty('--sparkle-size', size.toFixed(1) + 'px');
        svg.style.setProperty('--sparkle-x', (column * 100).toFixed(1) + '%');
        svg.style.setProperty('--sparkle-y', between(-22, 92).toFixed(1) + '%');
        svg.style.setProperty('--sparkle-delay', between(0, 1.6).toFixed(2) + 's');
        svg.style.setProperty('--sparkle-duration', between(1.1, 2.1).toFixed(2) + 's');
        svg.style.setProperty('--sparkle-turn', between(-40, 40).toFixed(0) + 'deg');

        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', SPARKLE_PATH);
        svg.appendChild(path);

        return svg;
    }
}
customElements.define('via-animated-sparkle-headline', SparkleAnimatedWordsElement);
