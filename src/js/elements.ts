/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Which concrete custom element each animation and counter id resolves to.
 *
 * This is the one piece of the manifest the runtime itself needs (the
 * <via-animated-headline> and <via-animated-counter> wrappers dispatch through
 * it), so it lives apart from the descriptive half - labels, ranges and help
 * text - which only integrations read and which therefore need not be shipped
 * to visitors.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

const WORD = 'via-animated-words-headline';
const LETTERS = 'via-animated-letters-headline';
const STAGGER = 'via-animated-stagger-headline';

export const ANIMATION_ELEMENTS: Record<string, string> = {
    'rotate-1': WORD,
    slide: WORD,
    push: WORD,
    zoom: WORD,
    blur: WORD,
    bounce: WORD,
    glitch: WORD,
    mirror: 'via-animated-mirror-headline',

    'rotate-2': LETTERS,
    'rotate-3': LETTERS,
    scale: LETTERS,
    wave: LETTERS,

    rise: STAGGER,
    pop: STAGGER,
    roll: STAGGER,
    rolling: STAGGER,
    shuffle: STAGGER,

    clip: 'via-animated-clip-headline',
    'clip-caret': 'via-animated-clip-caret-headline',
    'marker-caret': 'via-animated-marker-caret-headline',
    'loading-bar': 'via-animated-loading-headline',
    highlight: 'via-animated-highlight-headline',
    sparkle: 'via-animated-sparkle-headline',
    type: 'via-animated-type-headline',
    'type-delete': 'via-animated-type-delete-headline',
    swap: 'via-animated-swap-headline',
    flipboard: 'via-animated-flipboard-headline',
};

export const COUNTER_ELEMENTS: Record<string, string> = {
    clock: 'via-animated-clock',
    countdown: 'via-animated-countdown',
    timecode: 'via-animated-timecode',
    progress: 'via-animated-progress',
};
