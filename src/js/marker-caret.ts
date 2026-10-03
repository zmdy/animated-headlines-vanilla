/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * A highlighter that collapses and reopens between phrases: the marker (and
 * the word under it) is wiped back to the caret, the phrase is swapped behind
 * it, and the ink grows out again at the width of the new word.
 *
 * @author Christoph Massmann <cm@vianetz,com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import ClipCaretAnimatedWordsElement from './clip-caret';
import {drawShapeInto} from './highlight';

const DEFAULT_MARKER_SHAPE = 'marker';

export default class MarkerCaretAnimatedWordsElement extends ClipCaretAnimatedWordsElement {
    connectedCallback() {
        // The ink has to be in place before the first collapse measures a word.
        const shape = this.getAttribute('shape') ?? DEFAULT_MARKER_SHAPE;
        this.querySelectorAll(this.wordSelector).forEach(word => drawShapeInto(word as HTMLElement, shape));

        super.connectedCallback();
    }
}
customElements.define('via-animated-marker-caret-headline', MarkerCaretAnimatedWordsElement);
