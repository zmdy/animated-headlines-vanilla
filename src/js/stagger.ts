/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Staggered letters: the phrase is taken apart letter by letter and each
 * letter makes its own entrance (rise, pop, roll, rolling) - or, for `shuffle`,
 * cycles through random glyphs before it settles on the real one.
 *
 * The motion itself is all CSS; this class only keeps the leaving phrase
 * painted long enough for its letters to finish their exit, tags blank
 * letters so effects can skip them, and drives the shuffle.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedSingleLettersElement from './letters';
import {prefersReducedMotion} from './utilities';

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&@*?';

/** How long the last letter of a leaving phrase gets to finish its exit. */
const EXIT_GRACE = 900;

export default class StaggerAnimatedLettersElement extends AnimatedSingleLettersElement {
    private steps = 7;
    private tickDuration = 45;
    private charset = DEFAULT_CHARSET;

    connectedCallback() {
        super.connectedCallback();

        this.steps = this.hasAttribute('steps') ? parseInt(<string>this.getAttribute('steps')) : this.steps;
        this.tickDuration = this.hasAttribute('tick') ? parseInt(<string>this.getAttribute('tick')) : this.tickDuration;
        this.charset = this.getAttribute('charset') || this.charset;

        this.querySelectorAll('.' + this.letterClassName).forEach(letter => {
            const el = letter as HTMLElement;
            el.classList.toggle('space', (el.textContent ?? '').trim() === '');

            // Remember the real glyph, so a re-render (or an interrupted
            // shuffle) can always restore it.
            if (el.children.length === 0) {
                el.dataset.char ??= el.textContent ?? '';
                el.textContent = el.dataset.char;
            }
        });
    }

    /**
     * The base class drops the leaving phrase's marker on the very first
     * `animationend`, which would cut the exit short for every letter that has
     * not been hidden yet. Hold it until the last letter has had its turn.
     */
    protected markLeaving(word: HTMLElement) {
        const letters = word.querySelectorAll('.' + this.letterClassName).length;

        word.classList.add(this.leavingClassName);
        window.setTimeout(() => word.classList.remove(this.leavingClassName), letters * this.lettersDelay + EXIT_GRACE);
    }

    protected hideOrShowLetter(letter: HTMLElement, word: HTMLElement, isHideWordIfLastLetter: boolean = true, isHide: boolean = false) {
        super.hideOrShowLetter(letter, word, isHideWordIfLastLetter, isHide);

        if (! isHide && this.getAttribute('animation') === 'shuffle') {
            this.shuffle(letter);
        }
    }

    private shuffle(letter: HTMLElement): void {
        const real = letter.dataset.char;
        if (! real || real.trim() === '' || prefersReducedMotion()) {
            return;
        }

        // The phrase is only made visible after its first letter is, so wait
        // a frame before measuring.
        requestAnimationFrame(() => {
            // Pin the width of the real glyph, so the line does not breathe
            // while narrower and wider glyphs take turns.
            letter.style.width = letter.getBoundingClientRect().width + 'px';
            letter.classList.add('is-shuffling');

            const rounds = this.steps + Math.floor(Math.random() * 3);
            let round = 0;

            const tick = () => {
                if (round++ >= rounds) {
                    letter.textContent = real;
                    letter.classList.remove('is-shuffling');
                    letter.style.removeProperty('width');
                    return;
                }

                letter.textContent = this.charset.charAt(Math.floor(Math.random() * this.charset.length));
                window.setTimeout(tick, this.tickDuration);
            };

            tick();
        });
    }
}
customElements.define('via-animated-stagger-headline', StaggerAnimatedLettersElement);
