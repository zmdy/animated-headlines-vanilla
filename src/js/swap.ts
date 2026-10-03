/**
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

import AnimatedBoardElement from './board';
import {numberAttribute} from './utilities';

interface Cell {
    root: HTMLElement;
    shown: string;
    token: number;
}

export default class SwapAnimatedWordsElement extends AnimatedBoardElement {
    private cells: Cell[] = [];
    private duration = 420;
    private stagger = 140;

    protected configure(): void {
        this.duration = numberAttribute(this, 'speed', this.duration);
        this.stagger = numberAttribute(this, 'delay', this.stagger);
        this.style.setProperty('--ah-swap-duration', this.duration + 'ms');
    }

    protected createBoard(length: number, phrase: string): HTMLElement {
        const board = this.board();

        this.cells = Array.from({length}, (_, index) => {
            const root = document.createElement('span');
            root.className = 'ah-cell';
            root.appendChild(this.face(phrase.charAt(index), false));
            board.appendChild(root);

            return {root, shown: phrase.charAt(index), token: 0};
        });

        return board;
    }

    private face(char: string, entering: boolean): HTMLElement {
        const face = document.createElement('span');
        face.className = 'ah-face' + (entering ? ' is-in' : '');
        face.textContent = char;

        return face;
    }

    protected show(phrase: string): void {
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
