/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Swap: the phrase changes one letter at a time. Like the flipboard, the old
 * and the new phrase are compared position by position and only the letters
 * that differ move - each rolls out and the new one rolls in, left to right.
 *
 * The motion is CSS (`motion="roll"` slides through a masked window,
 * `motion="drum"` tips over a 3D drum); this class keeps the cells, hands out
 * the stagger and animates the width as letters of different widths trade
 * places.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedWordsElement from './words';
import {emit} from './utilities';

interface Cell {
    root: HTMLElement;
    shown: string;
    token: number;
}

export default class SwapAnimatedWordsElement extends AnimatedWordsElement {
    private cells: Cell[] = [];
    private duration = 420;
    private stagger = 140;

    connectedCallback() {
        this.duration = this.hasAttribute('speed') ? parseInt(<string>this.getAttribute('speed')) : this.duration;
        this.stagger = this.hasAttribute('delay') ? parseInt(<string>this.getAttribute('delay')) : this.stagger;
        this.style.setProperty('--ah-swap-duration', this.duration + 'ms');

        this.build();
        super.connectedCallback();
    }

    protected switchWord(oldWord: HTMLElement, newWord: HTMLElement) {
        this.makeHidden(oldWord);
        this.makeVisible(newWord);
        this.show(this.phraseOf(newWord));
        this.setAttribute('aria-label', this.phraseOf(newWord));

        emit(this, 'word-replaced', {old: oldWord, new: newWord});
    }

    private phraseOf(word: HTMLElement): string {
        return (word.textContent ?? '').trim().replace(/\s+/g, ' ');
    }

    private build(): void {
        // The host re-renders once per observed attribute and clones its
        // children each time, so a board from an earlier pass may be there.
        this.querySelector('.ah-board')?.remove();

        const words = Array.from(this.querySelectorAll(this.wordSelector)) as HTMLElement[];
        const length = Math.max(1, ...words.map(word => this.phraseOf(word).length));
        const current = this.current();
        const phrase = current === null ? '' : this.phraseOf(current);

        const board = document.createElement('span');
        board.className = 'ah-board';
        board.setAttribute('aria-hidden', 'true');

        this.cells = [];
        for (let i = 0; i < length; i++) {
            const root = document.createElement('span');
            root.className = 'ah-cell';
            root.appendChild(this.face(phrase.charAt(i), false));
            board.appendChild(root);

            this.cells.push({root, shown: phrase.charAt(i), token: 0});
        }
        this.prepend(board);

        this.setAttribute('role', 'img');
        this.setAttribute('aria-label', phrase);
    }

    private face(char: string, entering: boolean): HTMLElement {
        const face = document.createElement('span');
        face.className = 'ah-face' + (entering ? ' is-in' : '');
        face.textContent = char;

        return face;
    }

    private show(phrase: string): void {
        let order = 0;

        this.cells.forEach((cell, index) => {
            const target = phrase.charAt(index);
            if (target === cell.shown) {
                cell.token++; // a pending change to something else is off
                return;
            }

            const token = ++cell.token;
            window.setTimeout(() => {
                if (token === cell.token) {
                    this.change(cell, target);
                }
            }, order++ * this.stagger);
        });
    }

    private change(cell: Cell, target: string): void {
        const root = cell.root;

        // a roll still in flight is cut short rather than stacked
        root.querySelectorAll('.ah-face.is-out').forEach(face => face.remove());

        const old = root.querySelector('.ah-face') as HTMLElement;
        const before = root.getBoundingClientRect().width;

        const next = this.face(target, true);
        old.classList.remove('is-in');
        old.classList.add('is-out');
        root.appendChild(next);

        // Glide the cell from the old letter's width to the new one's.
        const after = next.getBoundingClientRect().width;
        root.style.width = before + 'px';
        void root.offsetWidth;
        root.style.width = after + 'px';

        cell.shown = target;

        window.setTimeout(() => {
            old.remove();
            // unless a newer change is still gliding, let the cell size itself again
            if (root.querySelector('.ah-face.is-out') === null) {
                root.style.removeProperty('width');
            }
        }, this.duration + 40);
    }
}
customElements.define('via-animated-swap-headline', SwapAnimatedWordsElement);
