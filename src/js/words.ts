/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {emit, numberAttribute} from "./utilities";

export default class AnimatedWordsElement extends HTMLElement {
    #isStopped = false;
    /** Bumped on every stop, so timers queued before it know they are stale. */
    #generation = 0;
    holdDelay: number = 2500;

    protected readonly wordSelector = 'b';
    protected readonly leavingClassName = 'is-leaving';

    connectedCallback() {
        this.holdDelay = numberAttribute(this, 'hold', this.holdDelay);
        this.resize();

        // The widths above are only right once the web font has arrived.
        document.fonts?.ready.then(() => this.isConnected && this.resize());

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (! prefersReducedMotion) {
            this.start();
        }

        emit(this, 'ready');
    }

    disconnectedCallback() {
        // Nobody is watching any more: do not keep cycling in the background.
        this.halt();
    }

    attributeChangedCallback() {
        this.resize();
    }

    protected resize() {
        const words = Array.from(this.querySelectorAll(this.wordSelector)) as HTMLElement[];

        // Assign to the wrapper element the width of its longest word, so the
        // surrounding copy does not jump every time the phrase changes.
        // A hidden word is `display: none` and would measure 0, so each one is
        // laid out (invisibly, out of flow) just long enough to be measured.
        // Writes and reads are kept apart, so the layout is computed once
        // instead of once per word.
        const measured = words.filter(word => word.hasAttribute('hidden'));
        measured.forEach(word => {
            word.style.display = 'inline-block';
            word.style.position = 'absolute';
            word.style.visibility = 'hidden';
            word.style.whiteSpace = 'nowrap';
        });

        const width = Math.max(0, ...words.map(word => word.offsetWidth));

        measured.forEach(word => {
            word.style.removeProperty('display');
            word.style.removeProperty('position');
            word.style.removeProperty('visibility');
            word.style.removeProperty('white-space');
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
        this.halt();
        emit(this, 'stopped');
    }

    private halt() {
        this.#isStopped = true;
        this.#generation++;
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

    /**
     * Runs `callable` once `duration` milliseconds have passed - unless the
     * element was stopped (or removed) in the meantime.
     */
    protected runAfter(duration: number, callable: () => any) {
        const generation = this.#generation;

        window.setTimeout(() => {
            if (! this.#isStopped && generation === this.#generation) {
                callable();
            }
        }, duration);
    }
}
customElements.define('via-animated-words-headline', AnimatedWordsElement);