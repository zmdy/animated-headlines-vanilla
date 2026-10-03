/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedWordsElement from "./words";
import {numberAttribute} from "./utilities";

class LoadingBarAnimatedWordsElement extends AnimatedWordsElement {
    readonly #loadingClassName = 'is-loading';
    barDelay = 500;

    connectedCallback() {
        super.connectedCallback();

        this.barDelay = numberAttribute(this, 'delay', this.barDelay);
        this.runAfter(this.barDelay, () => this.classList.add(this.#loadingClassName));
    }

    protected next(word: HTMLElement|null = null) {
        super.next(word);

        word = word ?? this.current();
        if (word === null) {
            return;
        }

        (word.parentNode as HTMLElement).classList.remove(this.#loadingClassName);
        this.runAfter(this.barDelay, () => (word.parentNode as HTMLElement).classList.add(this.#loadingClassName));
    }
}
customElements.define('via-animated-loading-headline', LoadingBarAnimatedWordsElement);