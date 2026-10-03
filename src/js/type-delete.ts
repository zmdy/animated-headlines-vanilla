/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Typewriter that backspaces: the phrase is typed out, held, then erased one
 * character at a time before the next one is typed in its place.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedSingleLettersElement from './letters';
import {numberAttribute} from './utilities';

export default class TypeDeleteAnimatedWordsElement extends AnimatedSingleLettersElement {
    protected readonly waitingClassName = 'waiting';

    /** Backspacing is quicker than typing, the way it is for a real typist. */
    eraseDelay: number = 40;

    connectedCallback() {
        super.connectedCallback();

        this.eraseDelay = numberAttribute(this, 'erase', Math.max(20, Math.round(this.lettersDelay * 0.6)));

        // The first phrase is typed in rather than just being there. The hold
        // for it is already scheduled by start(), so this pass must not queue
        // a second one.
        const word = this.current();
        if (word !== null) {
            this.typeWord(word, false);
        }
    }

    protected resize() {
        // The caret sits at the trailing edge, so the element has to shrink to
        // whatever has been typed so far instead of being pinned to the
        // longest phrase.
    }

    protected next(word: HTMLElement | null = null) {
        word = word ?? this.current();
        if (word === null) {
            return;
        }

        const letters = word.querySelectorAll('.' + this.letterClassName);
        if (letters.length === 0) {
            return;
        }

        this.classList.remove(this.waitingClassName);
        this.eraseLetter(letters[letters.length - 1] as HTMLElement, word);
    }

    /** Walks backwards through the phrase, hiding one character per tick. */
    private eraseLetter(letter: HTMLElement, word: HTMLElement) {
        this.makeHidden(letter);

        const previous = letter.previousElementSibling as HTMLElement | null;
        if (previous !== null) {
            this.runAfter(this.eraseDelay, () => this.eraseLetter(previous, word));

            return;
        }

        const nextWord = this.getNextWord(word);
        this.switchWord(word, nextWord);
        this.typeWord(nextWord);
    }

    private typeWord(word: HTMLElement, scheduleNext: boolean = true) {
        const letters = word.querySelectorAll('.' + this.letterClassName);
        if (letters.length === 0) {
            return;
        }

        letters.forEach(letter => this.makeHidden(letter as HTMLElement));
        this.makeVisible(word);
        this.typeLetter(letters[0] as HTMLElement, word, scheduleNext);
    }

    private typeLetter(letter: HTMLElement, word: HTMLElement, scheduleNext: boolean) {
        this.makeVisible(letter);

        const next = letter.nextElementSibling as HTMLElement | null;
        if (next !== null) {
            this.runAfter(this.lettersDelay, () => this.typeLetter(next, word, scheduleNext));

            return;
        }

        this.classList.add(this.waitingClassName);

        if (scheduleNext) {
            this.runAfter(this.holdDelay, () => this.next(word));
        }
    }
}
customElements.define('via-animated-type-delete-headline', TypeDeleteAnimatedWordsElement);
