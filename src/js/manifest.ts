/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * A machine-readable description of the component API.
 *
 * The elements themselves only ever read plain HTML attributes. This is that
 * same surface in a form an integration can walk - a page builder generating
 * its own control panel, a docs page listing what exists - so nothing has to
 * hard-code the catalogue of animations, shapes and options and then drift
 * from it.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {HIGHLIGHT_SHAPES, DEFAULT_SHAPE} from './shapes';
import {ANIMATION_ELEMENTS, COUNTER_ELEMENTS} from './elements';

export {ANIMATION_ELEMENTS, COUNTER_ELEMENTS} from './elements';

export type OptionType = 'number' | 'string' | 'boolean' | 'enum' | 'datetime';

export interface OptionSpec {
    type: OptionType;
    label: string;
    description?: string;
    default?: string | number | boolean;
    min?: number;
    max?: number;
    unit?: string;
    values?: string[];
    /** Longer free text (a character set, a phrase list) rather than a single line. */
    multiline?: boolean;
}

export interface AnimationSpec {
    id: string;
    label: string;
    /** The concrete custom element that <via-animated-headline> resolves to. */
    element: string;
    options: string[];
    /** Options whose default differs for this animation. */
    defaults?: Record<string, string | number | boolean>;
}

export interface CounterSpec {
    id: string;
    label: string;
    element: string;
    options: string[];
}

/**
 * Every attribute the components understand.
 *
 * A few names are reused across components with a different meaning - `delay`
 * is a per-letter stagger for the letter animations but the sweep duration for
 * `clip` - so the per-animation `defaults` below carry those overrides.
 */
export const OPTIONS: Record<string, OptionSpec> = {
    hold: {
        type: 'number', label: 'Hold', unit: 'ms', default: 2500, min: 300, max: 30000,
        description: 'How long a phrase stays before the next one takes over.',
    },
    delay: {
        type: 'number', label: 'Letter delay', unit: 'ms', default: 50, min: 0, max: 1000,
        description: 'Gap between one letter and the next.',
    },
    selection: {
        type: 'number', label: 'Selection', unit: 'ms', default: 500, min: 50, max: 5000,
        description: 'How long the finished phrase stays selected before it is replaced.',
    },
    erase: {
        type: 'number', label: 'Backspace speed', unit: 'ms', default: 30, min: 20, max: 500,
        description: 'Gap between backspaces. Erasing is normally quicker than typing.',
    },
    speed: {
        type: 'number', label: 'Change speed', unit: 'ms', default: 90, min: 20, max: 2000,
        description: 'How long a single character takes to change.',
    },
    steps: {
        type: 'number', label: 'Steps', default: 12, min: 1, max: 60,
        description: 'How many characters are cycled through before the real one lands.',
    },
    tick: {
        type: 'number', label: 'Tick', unit: 'ms', default: 45, min: 10, max: 500,
        description: 'How long each cycled character is shown.',
    },
    charset: {
        type: 'string', label: 'Character set', multiline: true,
        default: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        description: 'Characters cycled through on the way to the real one.',
    },
    sparkles: {
        type: 'number', label: 'Sparkles', default: 7, min: 0, max: 30,
        description: 'How many twinkles are scattered around each phrase.',
    },
    shape: {
        type: 'enum', label: 'Shape', default: DEFAULT_SHAPE,
        values: Object.keys(HIGHLIGHT_SHAPES),
        description: 'Which marker is drawn over the phrase.',
    },

    // Counter family
    format: {
        type: 'enum', label: 'Format', values: [],
        description: 'The choices differ per counter; see COUNTER_FORMATS.',
    },
    timezone: {
        type: 'string', label: 'Time zone',
        description: 'An IANA zone such as America/Sao_Paulo. Empty uses the one the visitor is in.',
    },
    target: {
        type: 'datetime', label: 'Counts down to',
        description: 'The moment the countdown runs out.',
    },
    start: {
        type: 'string', label: 'Start at', default: '00:00:00:00',
        description: 'Hours, minutes, seconds and frames.',
    },
    fps: { type: 'number', label: 'Frames per second', default: 30, min: 1, max: 120 },
    paused: { type: 'boolean', label: 'Paused', default: false },
    from: { type: 'number', label: 'From', default: 0 },
    to: { type: 'number', label: 'To', default: 100 },
    duration: { type: 'number', label: 'Duration', unit: 'ms', default: 1800, min: 0, max: 60000 },
    decimals: { type: 'number', label: 'Decimals', default: 0, min: 0, max: 6 },
    prefix: { type: 'string', label: 'Prefix' },
    suffix: { type: 'string', label: 'Suffix' },
    locale: {
        type: 'string', label: 'Locale',
        description: 'Number formatting, such as pt-BR. Empty uses the page language.',
    },
    bar: { type: 'boolean', label: 'Show bar', default: false },
    trigger: {
        type: 'enum', label: 'Starts', default: 'view', values: ['view', 'load'],
        description: 'The "view" setting waits until the counter is scrolled into sight.',
    },
};

export const ANIMATIONS: AnimationSpec[] = [
    { id: 'rotate-1', label: 'Rotate', element: ANIMATION_ELEMENTS['rotate-1'], options: ['hold'] },
    { id: 'slide', label: 'Slide', element: ANIMATION_ELEMENTS['slide'], options: ['hold'] },
    { id: 'push', label: 'Push', element: ANIMATION_ELEMENTS['push'], options: ['hold'] },
    { id: 'zoom', label: 'Zoom', element: ANIMATION_ELEMENTS['zoom'], options: ['hold'] },
    { id: 'blur', label: 'Blur', element: ANIMATION_ELEMENTS['blur'], options: ['hold'] },
    { id: 'bounce', label: 'Bounce', element: ANIMATION_ELEMENTS['bounce'], options: ['hold'] },
    { id: 'glitch', label: 'Glitch', element: ANIMATION_ELEMENTS['glitch'], options: ['hold'] },
    { id: 'mirror', label: 'Mirror', element: ANIMATION_ELEMENTS['mirror'], options: ['hold'] },

    { id: 'rotate-2', label: 'Rotate 2', element: ANIMATION_ELEMENTS['rotate-2'], options: ['hold', 'delay'] },
    { id: 'rotate-3', label: 'Rotate 3', element: ANIMATION_ELEMENTS['rotate-3'], options: ['hold', 'delay'] },
    { id: 'scale', label: 'Scale', element: ANIMATION_ELEMENTS['scale'], options: ['hold', 'delay'] },
    { id: 'wave', label: 'Wave', element: ANIMATION_ELEMENTS['wave'], options: ['hold', 'delay'] },

    { id: 'rise', label: 'Rise', element: ANIMATION_ELEMENTS['rise'], options: ['hold', 'delay'] },
    { id: 'pop', label: 'Pop', element: ANIMATION_ELEMENTS['pop'], options: ['hold', 'delay'] },
    { id: 'roll', label: 'Roll', element: ANIMATION_ELEMENTS['roll'], options: ['hold', 'delay'] },
    { id: 'rolling', label: 'Rolling', element: ANIMATION_ELEMENTS['rolling'], options: ['hold', 'delay'] },
    {
        id: 'shuffle', label: 'Shuffle', element: ANIMATION_ELEMENTS['shuffle'],
        options: ['hold', 'delay', 'steps', 'tick', 'charset'],
        defaults: {
            steps: 7,
            charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&@*?',
        },
    },

    {
        id: 'clip', label: 'Clip', element: 'via-animated-clip-headline',
        options: ['hold', 'delay'], defaults: { delay: 600 },
    },
    {
        id: 'clip-caret', label: 'Clip caret', element: 'via-animated-clip-caret-headline',
        options: ['hold', 'delay'], defaults: { delay: 600 },
    },
    {
        id: 'marker-caret', label: 'Marker caret', element: 'via-animated-marker-caret-headline',
        options: ['hold', 'delay', 'shape'], defaults: { delay: 600, shape: 'marker' },
    },
    {
        id: 'loading-bar', label: 'Loading bar', element: 'via-animated-loading-headline',
        options: ['hold', 'delay'], defaults: { delay: 500 },
    },
    { id: 'highlight', label: 'Highlight', element: ANIMATION_ELEMENTS['highlight'], options: ['hold', 'shape'] },
    { id: 'sparkle', label: 'Sparkle', element: ANIMATION_ELEMENTS['sparkle'], options: ['hold', 'sparkles'] },
    {
        id: 'type', label: 'Type', element: 'via-animated-type-headline',
        options: ['hold', 'delay', 'selection'], defaults: { hold: 1300 },
    },
    {
        id: 'type-delete', label: 'Type and delete', element: 'via-animated-type-delete-headline',
        options: ['hold', 'delay', 'erase'], defaults: { hold: 1800, delay: 90 },
    },
    {
        id: 'swap', label: 'Swap', element: 'via-animated-swap-headline',
        options: ['hold', 'delay', 'speed'], defaults: { delay: 140, speed: 420 },
    },
    {
        id: 'flipboard', label: 'Flip board', element: 'via-animated-flipboard-headline',
        options: ['hold', 'delay', 'speed', 'steps', 'charset'], defaults: { delay: 70 },
    },
];

export const COUNTERS: CounterSpec[] = [
    { id: 'clock', label: 'Clock', element: COUNTER_ELEMENTS['clock'], options: ['format', 'timezone'] },
    { id: 'countdown', label: 'Countdown', element: COUNTER_ELEMENTS['countdown'], options: ['target', 'format'] },
    { id: 'timecode', label: 'Timecode', element: COUNTER_ELEMENTS['timecode'], options: ['start', 'fps', 'format', 'paused'] },
    {
        id: 'progress', label: 'Counter', element: COUNTER_ELEMENTS['progress'],
        options: ['from', 'to', 'duration', 'decimals', 'prefix', 'suffix', 'locale', 'bar', 'trigger'],
    },
];

/** The `format` choices differ per counter, so they live here rather than on the option. */
export const COUNTER_FORMATS: Record<string, string[]> = {
    clock: ['24h', '12h'],
    countdown: ['full', 'compact'],
    timecode: ['full', 'compact'],
};

/** Highlight shape ids, in the order they are offered. */
export const SHAPES: string[] = Object.keys(HIGHLIGHT_SHAPES);
