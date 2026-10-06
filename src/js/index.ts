/**
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import '../scss/styles.scss';

import './letters';
import './words';
import './clip';
import './clip-caret';
import './highlight';
import './marker-caret';
import './sparkle';
import './loading-bar';
import './type';
import './type-delete';
import './stagger';
import './mirror';
import './flipboard';
import './swap';
import './clock';
import './countdown';
import './timecode';
import './progress';
import {ANIMATION_ELEMENTS, COUNTER_ELEMENTS} from './elements';

export enum AnimationType {
    Blur = 'blur',
    Bounce = 'bounce',
    Clip = 'clip',
    ClipCaret = 'clip-caret',
    Flipboard = 'flipboard',
    Glitch = 'glitch',
    Highlight = 'highlight',
    LoadingBar = 'loading-bar',
    MarkerCaret = 'marker-caret',
    Mirror = 'mirror',
    Pop = 'pop',
    Push = 'push',
    Rise = 'rise',
    Roll = 'roll',
    Rolling = 'rolling',
    Rotate1 = 'rotate-1',
    Rotate2 = 'rotate-2',
    Rotate3 = 'rotate-3',
    Scale = 'scale',
    Shuffle = 'shuffle',
    Slide = 'slide',
    Sparkle = 'sparkle',
    Swap = 'swap',
    Type = 'type',
    TypeDelete = 'type-delete',
    Wave = 'wave',
    Zoom = 'zoom'
}

/** animation id -> the concrete element it resolves to, straight from the manifest. */
const ELEMENT_BY_ANIMATION = new Map(Object.entries(ANIMATION_ELEMENTS));

function createAnimatedHeadline(animationType: AnimationType, attributes: NamedNodeMap) {
    const tag = ELEMENT_BY_ANIMATION.get(animationType);
    if (tag === undefined) {
        throw new Error('invalid animation type ' + animationType
            + ' (must be one of ' + Array.from(ELEMENT_BY_ANIMATION.keys()) + ')');
    }

    const element = document.createElement(tag);

    // copy attributes to child
    Array.from(attributes).forEach(attr => element.setAttribute(attr.name, attr.value));

    return element;
}

/**
 * You can either use the global <via-animated-headline> custom element or the specific ones directly like <via-animated-type-headline>.
 * This element simply instantiates the right sub-component and adds all attributes from the parent.
 */
class AnimatedHeadline extends HTMLElement {
    static get observedAttributes() {
        return ['animation', 'hold', 'delay', 'shape'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const animationType = this.getAttribute('animation') as AnimationType;
        const wrapper = createAnimatedHeadline(animationType, this.attributes);

        // re-add the inner contents of the element
        Array.from(this.children).forEach(child => {
            if (child.tagName?.startsWith('VIA-ANIMATED-')) {
                child.childNodes.forEach(n => wrapper.appendChild(n.cloneNode(true)));
            } else {
                wrapper.appendChild(child.cloneNode(true));
            }
        });

        this.innerHTML = '';
        this.appendChild(wrapper);
    }
}
customElements.define('via-animated-headline', AnimatedHeadline);

/** counter id -> element, also from the manifest. */
const ELEMENT_BY_COUNTER = new Map(Object.entries(COUNTER_ELEMENTS));

export enum CounterType {
    Clock = 'clock',
    Countdown = 'countdown',
    Progress = 'progress',
    Timecode = 'timecode'
}

/**
 * Same idea as <via-animated-headline>, for the counter family: pick the effect with the
 * `animation` attribute (clock, countdown, timecode, progress) and every other attribute is
 * handed on to the matching element. To change an attribute while it runs, set it on the
 * concrete element (e.g. <via-animated-countdown>) instead.
 */
class AnimatedCounter extends HTMLElement {
    static get observedAttributes() {
        return ['animation'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const type = this.getAttribute('animation') as CounterType;
        const tag = ELEMENT_BY_COUNTER.get(type);
        if (tag === undefined) {
            throw new Error('invalid counter type ' + type
                + ' (must be one of ' + Array.from(ELEMENT_BY_COUNTER.keys()) + ')');
        }

        const element = document.createElement(tag);
        Array.from(this.attributes).forEach(attr => element.setAttribute(attr.name, attr.value));

        this.innerHTML = '';
        this.appendChild(element);
    }
}
customElements.define('via-animated-counter', AnimatedCounter);
