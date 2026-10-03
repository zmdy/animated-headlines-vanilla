/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {emit} from "./utilities";

/** @see https://javascript.info/js-animation */
function animate(timing: (timeFraction: number) => any, draw: (timePassed: number) => any, duration: number) {
    let start = performance.now();

    requestAnimationFrame(function animate(time) {
        // timeFraction goes from 0 to 1
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;

        // calculate the current animation state
        let progress = timing(timeFraction);

        draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        }
    });
}

export default class AnimatedWordsElement extends HTMLElement {
    #isStopped = false;
    holdDelay: number = 2500;

    protected readonly wordSelector = 'b';
    protected readonly leavingClassName = 'is-leaving';

    connectedCallback() {
        this.holdDelay = this.hasAttribute('hold') ? parseInt(<string>this.getAttribute('hold')) : this.holdDelay;
        this.resize();

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (! prefersReducedMotion) {
            this.start();
        }

        emit(this, 'ready');
    }

    attributeChangedCallback() {
        this.resize();
    }

    protected resize() {
        let width = 0;
        // Assign to the wrapper element the width of its longest word, so the
        // surrounding copy does not jump every time the phrase changes.
        // A hidden word is `display: none` and would measure 0, so each one is
        // laid out (invisibly, out of flow) just long enough to be measured.
        this.querySelectorAll(this.wordSelector).forEach(function (e) {
            const word = e as HTMLElement;
            const isHidden = word.hasAttribute('hidden');

            if (isHidden) {
                word.style.display = 'inline-block';
                word.style.position = 'absolute';
                word.style.visibility = 'hidden';
                word.style.whiteSpace = 'nowrap';
            }

            width = Math.max(word.offsetWidth, width);

            if (isHidden) {
                word.style.removeProperty('display');
                word.style.removeProperty('position');
                word.style.removeProperty('visibility');
                word.style.removeProperty('white-space');
            }
        });

        this.style.width = width + 'px';

        emit(this, 'resized', {width: width.toString()});
    }

    /** @api */
    public start() {
        this.#isStopped = false;
        this.runAfter(this.holdDelay, () => this.next());
        emit(this, 'started');
    }

    /** @api */
    public stop() {
        this.#isStopped = true;
        emit(this, 'stopped');
    }

    /** @api */
    public current(): HTMLElement|null {
        const visibleElement = this.querySelector(this.wordSelector + ':not([hidden])') as HTMLElement;

        return visibleElement ?? this.querySelector(this.wordSelector); // simply select the first word by default
    }

    // main logic
    protected next(word: HTMLElement|null = null) {
        word = word ?? this.current();
        if (word === null) {
            return;
        }

        const nextWord = this.getNextWord(word);

        this.switchWord(word, nextWord);
        this.runAfter(this.holdDelay, () => this.next(nextWord));
    }

    protected getNextWord(word: HTMLElement) {
        return (word.nextElementSibling ? word.nextElementSibling : word.parentNode!.children[0]) as HTMLElement;
    }

    protected switchWord(oldWord: HTMLElement, newWord: HTMLElement) {
        this.makeHidden(oldWord);
        this.makeVisible(newWord);
        this.markLeaving(oldWord);

        emit(this, 'word-replaced', {old: oldWord, new: newWord});
    }

    /**
     * A hidden element is `display: none`, so without this the exit half of
     * every animation would never be painted. Only the phrase that actually
     * just left is marked, which keeps the phrases that merely start out
     * hidden silent on the first render.
     */
    protected markLeaving(word: HTMLElement) {
        word.classList.add(this.leavingClassName);
        word.addEventListener(
            'animationend',
            () => word.classList.remove(this.leavingClassName),
            {once: true}
        );
    }

    protected makeVisible(element: HTMLElement) {
        element.classList.remove(this.leavingClassName);
        element.removeAttribute('hidden');
    }

    protected makeHidden(element: HTMLElement) {
        element.setAttribute('hidden', '');
    }

    protected runAfter(duration: number, callable: () => any) {
        animate((timeFraction: number) => { return timeFraction }, (timePassed: number) => {
            if (this.#isStopped) {
                throw 'execution aborted';
            }

            if (timePassed !== 1) {
                return;
            }

            callable();
        }, duration);
    }
}
customElements.define('via-animated-words-headline', AnimatedWordsElement);