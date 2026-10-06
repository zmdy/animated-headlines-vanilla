/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Highlight annotations: a hand-drawn marker (underline, circle, scribble,
 * cross-out, ...) is drawn over the current word with an SVG stroke.
 *
 * Every path carries `pathLength="100"`, which normalises its length, so the
 * draw-on animation is a plain CSS keyframe (`stroke-dashoffset: 100 -> 0`)
 * and no JavaScript has to measure anything.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedWordsElement from './words';
import {HIGHLIGHT_SHAPES, DEFAULT_SHAPE} from './shapes';

export {HIGHLIGHT_SHAPES, DEFAULT_SHAPE} from './shapes';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * The viewBox every shape is authored in. Combined with
 * `preserveAspectRatio="none"` the drawing stretches to whatever box the
 * current word occupies, so one path fits every word length.
 */
const VIEW_BOX = '0 0 500 150';


/**
 * Draws a shape into a phrase, unless the author already supplied their own
 * SVG. Shared with the components that pair a marker with another reveal.
 */
export function drawShapeInto(word: HTMLElement, shapeName: string): void {
    const shape = HIGHLIGHT_SHAPES[shapeName];

    if (shape === undefined) {
        console.warn(
            'unknown highlight shape "' + shapeName + '" (must be one of ' + Object.keys(HIGHLIGHT_SHAPES) + ')'
        );

        return;
    }

    if (word.querySelector('svg') !== null) {
        return;
    }

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', VIEW_BOX);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    shape.forEach(definition => {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', definition);
        path.setAttribute('pathLength', '100');
        svg.appendChild(path);
    });

    word.appendChild(svg);
}

export default class AnimatedHighlightElement extends AnimatedWordsElement {
    protected readonly loopingClassName = 'is-looping';

    connectedCallback() {
        this.decorateWords();
        super.connectedCallback();
    }

    /**
     * A single phrase has nothing to rotate to, so the stylesheet loops the
     * drawing instead of the element switching words.
     */
    public start() {
        if (this.isSinglePhrase()) {
            return;
        }

        super.start();
    }

    protected isSinglePhrase(): boolean {
        return this.querySelectorAll(this.wordSelector).length < 2;
    }

    private decorateWords(): void {
        const shapeName = this.getAttribute('shape') ?? DEFAULT_SHAPE;

        if (this.isSinglePhrase()) {
            this.classList.add(this.loopingClassName);
        }

        this.querySelectorAll(this.wordSelector).forEach(word => drawShapeInto(word as HTMLElement, shapeName));
    }
}
customElements.define('via-animated-highlight-headline', AnimatedHighlightElement);
