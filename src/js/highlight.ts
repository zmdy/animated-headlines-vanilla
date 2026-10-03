/**!
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

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * The viewBox every shape is authored in. Combined with
 * `preserveAspectRatio="none"` the drawing stretches to whatever box the
 * current word occupies, so one path fits every word length.
 */
const VIEW_BOX = '0 0 500 150';

/**
 * Original marker shapes. A shape is a list of paths; they are drawn one
 * after the other (see the `nth-of-type` delays in the stylesheet), which is
 * what makes the two-stroke shapes read as a real pen stroke.
 */
export const HIGHLIGHT_SHAPES: Record<string, string[]> = {
    underline: [
        'M8 130 C104 116 206 112 308 116 C374 118 438 122 492 130',
    ],
    'double-underline': [
        'M10 126 C110 114 218 110 322 114 C388 116 446 120 490 126',
        'M34 144 C128 135 232 131 330 133 C388 134 436 137 468 142',
    ],
    scribble: [
        'M10 128 C44 112 70 140 104 124 C138 108 164 136 198 120 C232 104 258 132 292 116 C326 100 352 128 386 112 C420 96 446 124 490 110',
    ],
    circle: [
        'M268 14 C150 10 30 36 20 74 C12 108 110 136 244 140 C372 144 482 118 484 80 C486 44 384 16 252 14 C214 14 182 18 152 26',
    ],
    zigzag: [
        'M10 136 L48 116 L86 136 L124 116 L162 136 L200 116 L238 136 L276 116 L314 136 L352 116 L390 136 L428 116 L466 136 L490 124',
    ],
    strikethrough: [
        'M10 74 C120 62 250 60 376 64 C420 66 460 70 492 76',
    ],
    'cross-out': [
        'M486 22 C372 48 220 86 96 114 C68 120 40 126 14 132',
        'M16 24 C130 48 282 86 406 116 C434 122 462 128 486 134',
    ],
    diagonal: [
        'M474 20 C372 48 234 88 118 118 C88 126 58 132 26 136',
    ],
    box: [
        'M20 22 C160 12 338 12 482 20 C490 60 490 96 482 132 C340 142 160 142 18 132 C10 96 10 58 20 22',
    ],
    brackets: [
        'M74 14 C40 16 22 22 18 34 C12 62 12 92 18 118 C22 132 42 138 76 138',
        'M426 14 C460 16 478 22 482 34 C488 62 488 92 482 118 C478 132 458 138 424 138',
    ],
    arc: [
        'M12 104 C86 146 220 160 338 150 C410 144 466 126 492 92',
    ],
    wave: [
        'M8 120 C32 100 56 140 80 120 C104 100 128 140 152 120 C176 100 200 140 224 120 C248 100 272 140 296 120 C320 100 344 140 368 120 C392 100 416 140 440 120 C464 100 480 132 494 118',
    ],
    marker: [
        'M16 88 C140 70 320 68 484 80',
    ],
    'corner-ticks': [
        'M16 48 L16 16 L58 16',
        'M442 16 L484 16 L484 48',
        'M484 102 L484 134 L442 134',
        'M58 134 L16 134 L16 102',
    ],
};

export const DEFAULT_SHAPE = 'underline';

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
        const shape = HIGHLIGHT_SHAPES[shapeName];

        if (shape === undefined) {
            console.warn(
                'unknown highlight shape "' + shapeName + '" (must be one of ' + Object.keys(HIGHLIGHT_SHAPES) + ')'
            );

            return;
        }

        if (this.isSinglePhrase()) {
            this.classList.add(this.loopingClassName);
        }

        this.querySelectorAll(this.wordSelector).forEach(word => this.drawShape(word as HTMLElement, shape));
    }

    private drawShape(word: HTMLElement, shape: string[]): void {
        if (word.querySelector('svg') !== null) {
            return; // the author supplied their own drawing
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
}
customElements.define('via-animated-highlight-headline', AnimatedHighlightElement);
