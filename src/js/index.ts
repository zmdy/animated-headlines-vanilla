/**!
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
import './loading-bar';
import './type';
import './type-delete';

export enum AnimationType {
    Blur = 'blur',
    Bounce = 'bounce',
    Clip = 'clip',
    ClipCaret = 'clip-caret',
    Glitch = 'glitch',
    Highlight = 'highlight',
    LoadingBar = 'loading-bar',
    MarkerCaret = 'marker-caret',
    Push = 'push',
    Rotate1 = 'rotate-1',
    Rotate2 = 'rotate-2',
    Rotate3 = 'rotate-3',
    Scale = 'scale',
    Slide = 'slide',
    Type = 'type',
    TypeDelete = 'type-delete',
    Wave = 'wave',
    Zoom = 'zoom'
}

function createAnimatedHeadline(animationType: AnimationType, attributes: NamedNodeMap) {
    let element;

    switch (animationType) {
        case AnimationType.Clip:
            element = document.createElement('via-animated-clip-headline');
            break;
        case AnimationType.ClipCaret:
            element = document.createElement('via-animated-clip-caret-headline');
            break;
        case AnimationType.LoadingBar:
            element = document.createElement('via-animated-loading-headline');
            break;
        case AnimationType.Highlight:
            element = document.createElement('via-animated-highlight-headline');
            break;
        case AnimationType.MarkerCaret:
            element = document.createElement('via-animated-marker-caret-headline');
            break;
        case AnimationType.Push:
        case AnimationType.Slide:
        case AnimationType.Rotate1:
        case AnimationType.Zoom:
        case AnimationType.Blur:
        case AnimationType.Bounce:
        case AnimationType.Glitch:
            element = document.createElement('via-animated-words-headline');
            break;
        case AnimationType.Scale:
        case AnimationType.Rotate2:
        case AnimationType.Rotate3:
        case AnimationType.Wave:
            element = document.createElement('via-animated-letters-headline');
            break;
        case AnimationType.Type:
            element = document.createElement('via-animated-type-headline');
            break;
        case AnimationType.TypeDelete:
            element = document.createElement('via-animated-type-delete-headline');
            break;
        default:
            throw new Error('invalid animation type ' + animationType + ' (must be one of ' + Object.values(AnimationType) + ')');
    }

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