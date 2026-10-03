/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Flipboard: the phrase is shown on an airport-style split-flap board. Like
 * the clock, it compares the old and the new phrase character by character and
 * only the tiles that differ flip - each one stepping through the alphabet
 * until it lands on its new character, left to right.
 *
 * Every tile is four halves: the static top and bottom, and two flaps that
 * fold over the hinge. The folding is driven with the Web Animations API, one
 * flip per character step.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedBoardElement from './board';
import {numberAttribute} from './utilities';

const DEFAULT_CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const PERSPECTIVE = 'perspective(420px) ';

interface Tile {
    root: HTMLElement;
    top: HTMLElement;
    bottom: HTMLElement;
    flapTop: HTMLElement;
    flapBottom: HTMLElement;
    shown: string;
    token: number;
    animations: Animation[];
}

const sleep = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));

function paint(half: HTMLElement, char: string): void {
    (half.firstElementChild as HTMLElement).textContent = char;
}

export default class FlipboardAnimatedWordsElement extends AnimatedBoardElement {
    private tiles: Tile[] = [];
    private charset = DEFAULT_CHARSET;
    private speed = 90;
    private stagger = 70;
    private maxSteps = 12;

    protected configure(): void {
        this.charset = this.getAttribute('charset') || this.charset;
        this.speed = numberAttribute(this, 'speed', this.speed);
        this.stagger = numberAttribute(this, 'delay', this.stagger);
        this.maxSteps = numberAttribute(this, 'steps', this.maxSteps);
    }

    // The board has a fixed number of tiles, so there is nothing to measure.
    protected resize() {}

    // A split-flap board only has capitals.
    protected phraseOf(word: HTMLElement): string {
        return super.phraseOf(word).toUpperCase();
    }

    protected createBoard(length: number, phrase: string): HTMLElement {
        const board = this.board();

        this.tiles = Array.from({length}, () => this.makeTile());
        board.append(...this.tiles.map(tile => tile.root));
        this.settleOn(phrase);

        return board;
    }

    private makeTile(): Tile {
        const half = (className: string) => {
            const element = document.createElement('span');
            element.className = 'ah-half ' + className;
            const glyph = document.createElement('span');
            glyph.className = 'ah-glyph';
            element.appendChild(glyph);

            return element;
        };

        const root = document.createElement('span');
        root.className = 'ah-tile';

        const top = half('ah-top');
        const bottom = half('ah-bottom');
        const flapTop = half('ah-top ah-flap');
        const flapBottom = half('ah-bottom ah-flap');
        root.append(top, bottom, flapTop, flapBottom);

        return {root, top, bottom, flapTop, flapBottom, shown: ' ', token: 0, animations: []};
    }

    /** Put the board on `phrase` without any motion. */
    private settleOn(phrase: string): void {
        this.tiles.forEach((tile, index) => {
            tile.shown = phrase.charAt(index) || ' ';
            this.settle(tile);
        });
    }

    private settle(tile: Tile): void {
        tile.animations.forEach(animation => animation.cancel());
        tile.animations = [];
        tile.root.classList.remove('is-flipping');
        paint(tile.top, tile.shown);
        paint(tile.bottom, tile.shown);
    }

    protected show(phrase: string): void {
        let order = 0;

        this.tiles.forEach((tile, index) => {
            const target = phrase.charAt(index) || ' ';

            // same character -> the tile stays put, and does not wait either
            if (target === tile.shown && tile.root.classList.contains('is-flipping') === false) {
                tile.token++;
                return;
            }

            this.run(tile, target, order++ * this.stagger);
        });
    }

    private async run(tile: Tile, target: string, wait: number): Promise<void> {
        const token = ++tile.token;

        await sleep(wait);
        if (token !== tile.token) {
            return;
        }

        const path = this.path(tile.shown, target);
        if (path.length === 0) {
            return this.settle(tile);
        }

        tile.root.classList.add('is-flipping');

        for (const next of path) {
            await this.step(tile, tile.shown, next);

            if (token !== tile.token) {
                return;
            }
            tile.shown = next;
        }

        this.settle(tile);
    }

    /** The characters a tile steps through on its way from one to the other. */
    private path(from: string, to: string): string[] {
        if (from === to) {
            return [];
        }

        const start = this.charset.indexOf(from);
        const end = this.charset.indexOf(to);

        // characters the board has no flap for flip straight there
        if (start < 0 || end < 0) {
            return [to];
        }

        const steps: string[] = [];
        for (let i = (start + 1) % this.charset.length; ; i = (i + 1) % this.charset.length) {
            steps.push(this.charset.charAt(i));
            if (i === end) {
                break;
            }
        }

        // a long way round is cut short, but always ends on the right character
        return steps.slice(-this.maxSteps);
    }

    /** One flip: the top flap falls over the hinge, then the bottom flap lands. */
    private async step(tile: Tile, from: string, to: string): Promise<void> {
        paint(tile.top, to);
        paint(tile.bottom, from);
        paint(tile.flapTop, from);
        paint(tile.flapBottom, to);

        const half = Math.max(1, this.speed / 2);
        tile.animations.forEach(animation => animation.cancel());

        const fall = tile.flapTop.animate(
            [{transform: PERSPECTIVE + 'rotateX(0deg)'}, {transform: PERSPECTIVE + 'rotateX(-90deg)'}],
            {duration: half, easing: 'ease-in', fill: 'forwards'}
        );
        const land = tile.flapBottom.animate(
            [{transform: PERSPECTIVE + 'rotateX(90deg)'}, {transform: PERSPECTIVE + 'rotateX(0deg)'}],
            {duration: half, delay: half, easing: 'ease-out', fill: 'both'}
        );
        tile.animations = [fall, land];

        try {
            await land.finished;
        } catch {
            return; // cancelled by a newer phrase
        }

        paint(tile.bottom, to);
    }
}
customElements.define('via-animated-flipboard-headline', FlipboardAnimatedWordsElement);
