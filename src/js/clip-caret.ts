/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Clip reveal with a terminal caret: the phrase is wiped in behind the bar,
 * and while it is being held the bar blinks instead of standing still.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import ClipAnimatedWordsElement from './clip';

export default class ClipCaretAnimatedWordsElement extends ClipAnimatedWordsElement {
    protected readonly waitingClassName = 'waiting';

    protected showWord(word: HTMLElement) {
        const animation = this.animate(
            [{width: '2px'}, {width: word.offsetWidth + 'px'}],
            {duration: this.revealDelay}
        );

        // The caret only blinks once the phrase has finished being wiped in —
        // a bar that blinks while it is still travelling reads as a glitch
        // rather than as something waiting for the next keystroke.
        animation.onfinish = () => {
            this.classList.add(this.waitingClassName);
            this.runAfter(this.holdDelay, () => this.next(word));
        };
    }

    protected next(word: HTMLElement | null = null) {
        this.classList.remove(this.waitingClassName);

        super.next(word);
    }
}
customElements.define('via-animated-clip-caret-headline', ClipCaretAnimatedWordsElement);
