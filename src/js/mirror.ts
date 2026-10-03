/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Mirror: the phrase arrives flanked by two ghost copies that close in from
 * opposite sides and merge into it, like a reflection snapping into place.
 *
 * The ghosts are pseudo-elements that read the phrase from `data-text`, which
 * is all this class has to provide.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedWordsElement from './words';

export default class MirrorAnimatedWordsElement extends AnimatedWordsElement {
    connectedCallback() {
        this.querySelectorAll(this.wordSelector).forEach(word => {
            (word as HTMLElement).dataset.text = word.textContent ?? '';
        });

        super.connectedCallback();
    }
}
customElements.define('via-animated-mirror-headline', MirrorAnimatedWordsElement);
