/**
 * Guards the manifest against drifting from the components it describes.
 *
 * The manifest is what integrations build their UI from, so a wrong element
 * name or a default for an option that no longer exists is a silent breakage
 * on their side rather than ours. It must also stay free of DOM imports -
 * importing it here, in Node, is itself the check for that.
 */
import {ANIMATIONS, COUNTERS, OPTIONS, SHAPES, COUNTER_FORMATS, THEME} from './dist/manifest.js';
import {ANIMATION_ELEMENTS, COUNTER_ELEMENTS} from './dist/manifest.js';

const problems = [];

function checkEntries(entries, kind, elementMap) {
    for (const entry of entries) {
        if (typeof entry.element !== 'string' || !entry.element.startsWith('via-animated-')) {
            problems.push(`${kind} "${entry.id}" has no usable element (${entry.element})`);
        }
        if (elementMap && elementMap[entry.id] !== entry.element) {
            problems.push(`${kind} "${entry.id}" element disagrees with the element map`);
        }
        for (const option of entry.options) {
            if (!OPTIONS[option]) problems.push(`${kind} "${entry.id}" uses unknown option "${option}"`);
        }
        for (const key of Object.keys(entry.defaults ?? {})) {
            if (!entry.options.includes(key)) {
                problems.push(`${kind} "${entry.id}" overrides "${key}", which it does not use`);
            }
        }
    }
}

checkEntries(ANIMATIONS, 'animation');
checkEntries(COUNTERS, 'counter');

for (const [counter, formats] of Object.entries(COUNTER_FORMATS)) {
    if (!COUNTERS.some((entry) => entry.id === counter)) {
        problems.push(`COUNTER_FORMATS lists "${counter}", which is not a counter`);
    }
    if (!formats.length) problems.push(`counter "${counter}" has no formats`);
}

if (!SHAPES.length) problems.push('no highlight shapes exported');
if (OPTIONS.shape && OPTIONS.shape.values.join() !== SHAPES.join()) {
    problems.push('the "shape" option and SHAPES list different shapes');
}

for (const [feature, variables] of Object.entries(THEME)) {
    for (const spec of variables) {
        if (!spec.variable.startsWith('--ah-')) problems.push(`${feature}: "${spec.variable}" is not an --ah- property`);
        if (!spec.default) problems.push(`${feature}: "${spec.variable}" has no default`);
        for (const target of Object.keys(spec.overrides ?? {})) {
            const known = SHAPES.includes(target) || ANIMATIONS.some((a) => a.id === target);
            if (!known) problems.push(`${feature}: "${spec.variable}" overrides unknown "${target}"`);
        }
    }
}

if (problems.length) {
    console.error('manifest is inconsistent:\n  ' + problems.join('\n  '));
    process.exit(1);
}

const themed = Object.values(THEME).reduce((n, list) => n + list.length, 0);
console.log(`manifest ok: ${ANIMATIONS.length} animations, ${COUNTERS.length} counters, ${SHAPES.length} shapes, ${Object.keys(OPTIONS).length} options, ${themed} theme variables`);
