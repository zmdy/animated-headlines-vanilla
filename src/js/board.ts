/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Shared base of the "board" effects (flipboard, swap): the phrase lives in a
 * row of cells, one per character, and a new phrase is shown by comparing it
 * with the old one cell by cell, so that only the cells that differ move.
 *
 * The plain `<b>` phrases stay in the markup as the text source - they keep
 * the rotation state, the width of the longest phrase and the fallback text for
 * reduced motion - while the board is what gets painted and animated.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedWordsElement from './words';
import {emit} from './utilities';

export default abstract class AnimatedBoardElement extends AnimatedWordsElement {
    connectedCallback() {
        this.configure();
        this.build();
        super.connectedCallback();
    }

    /** Read the effect's own attributes. */
    protected abstract configure(): void;

    /** Create the board for `length` cells, showing `phrase` without any motion. */
    protected abstract createBoard(length: number, phrase: string): HTMLElement;

    /** Bring the board to `phrase`, moving only the cells that differ. */
    protected abstract show(phrase: string): void;

    /** What a word is shown as on the board. */
    protected phraseOf(word: HTMLElement): string {
        return (word.textContent ?? '').trim().replace(/\s+/g, ' ');
    }

    protected switchWord(oldWord: HTMLElement, newWord: HTMLElement) {
        this.makeHidden(oldWord);
        this.makeVisible(newWord);
        this.show(this.phraseOf(newWord));
        this.label(newWord);

        emit(this, 'word-replaced', {old: oldWord, new: newWord});
    }

    private build(): void {
        // The host re-renders once per observed attribute and clones its
        // children each time, so a board from an earlier pass may be there.
        this.querySelector('.ah-board')?.remove();

        const words = Array.from(this.querySelectorAll(this.wordSelector)) as HTMLElement[];
        const length = Math.max(1, ...words.map(word => this.phraseOf(word).length));
        const current = this.current();

        this.prepend(this.createBoard(length, current === null ? '' : this.phraseOf(current)));

        this.setAttribute('role', 'img');
        this.label(current);
    }

    /** The board is decoration; assistive technology gets the plain phrase. */
    private label(word: HTMLElement | null): void {
        this.setAttribute('aria-label', (word?.textContent ?? '').trim().replace(/\s+/g, ' '));
    }

    protected board(): HTMLElement {
        const board = document.createElement('span');
        board.className = 'ah-board';
        board.setAttribute('aria-hidden', 'true');

        return board;
    }
}
