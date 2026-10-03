const r = (i, e, s, t = !1) => i.dispatchEvent(new CustomEvent(`via-animated-headline:${e}`, { bubbles: !0, cancelable: t, detail: s }));
function p(i, e, s) {
  let t = performance.now();
  requestAnimationFrame(function a(n) {
    let l = (n - t) / s;
    l > 1 && (l = 1);
    let m = i(l);
    e(m), l < 1 && requestAnimationFrame(a);
  });
}
class h extends HTMLElement {
  #e = !1;
  holdDelay = 2500;
  wordSelector = "b";
  leavingClassName = "is-leaving";
  connectedCallback() {
    this.holdDelay = this.hasAttribute("hold") ? parseInt(this.getAttribute("hold")) : this.holdDelay, this.resize(), window.matchMedia("(prefers-reduced-motion: reduce)").matches || this.start(), r(this, "ready");
  }
  attributeChangedCallback() {
    this.resize();
  }
  resize() {
    let e = 0;
    this.querySelectorAll(this.wordSelector).forEach(function(s) {
      const t = s, a = t.hasAttribute("hidden");
      a && (t.style.display = "inline-block", t.style.position = "absolute", t.style.visibility = "hidden", t.style.whiteSpace = "nowrap"), e = Math.max(t.offsetWidth, e), a && (t.style.removeProperty("display"), t.style.removeProperty("position"), t.style.removeProperty("visibility"), t.style.removeProperty("white-space"));
    }), this.style.width = e + "px", r(this, "resized", { width: e.toString() });
  }
  /** @api */
  start() {
    this.#e = !1, this.runAfter(this.holdDelay, () => this.next()), r(this, "started");
  }
  /** @api */
  stop() {
    this.#e = !0, r(this, "stopped");
  }
  /** @api */
  current() {
    return this.querySelector(this.wordSelector + ":not([hidden])") ?? this.querySelector(this.wordSelector);
  }
  // main logic
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const s = this.getNextWord(e);
    this.switchWord(e, s), this.runAfter(this.holdDelay, () => this.next(s));
  }
  getNextWord(e) {
    return e.nextElementSibling ? e.nextElementSibling : e.parentNode.children[0];
  }
  switchWord(e, s) {
    this.makeHidden(e), this.makeVisible(s), this.markLeaving(e), r(this, "word-replaced", { old: e, new: s });
  }
  /**
   * A hidden element is `display: none`, so without this the exit half of
   * every animation would never be painted. Only the phrase that actually
   * just left is marked, which keeps the phrases that merely start out
   * hidden silent on the first render.
   */
  markLeaving(e) {
    e.classList.add(this.leavingClassName), e.addEventListener(
      "animationend",
      () => e.classList.remove(this.leavingClassName),
      { once: !0 }
    );
  }
  makeVisible(e) {
    e.classList.remove(this.leavingClassName), e.removeAttribute("hidden");
  }
  makeHidden(e) {
    e.setAttribute("hidden", "");
  }
  runAfter(e, s) {
    p((t) => t, (t) => {
      if (this.#e)
        throw "execution aborted";
      t === 1 && s();
    }, e);
  }
}
customElements.define("via-animated-words-headline", h);
class d extends h {
  lettersDelay = 50;
  letterClassName = "letter";
  connectedCallback() {
    super.connectedCallback(), this.lettersDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.lettersDelay, this.querySelectorAll(this.wordSelector).forEach(this.splitIntoSingleLetters, this);
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const s = this.getNextWord(e), t = e.querySelectorAll("." + this.letterClassName).length >= s.querySelectorAll("." + this.letterClassName).length;
    this.hideLetter(e.querySelector("." + this.letterClassName), e, t), this.showLetter(s.querySelector("." + this.letterClassName), s, !t), this.switchWord(e, s);
  }
  hideLetter(e, s, t) {
    this.hideOrShowLetter(e, s, t, !0);
  }
  showLetter(e, s, t) {
    this.hideOrShowLetter(e, s, t, !1);
  }
  hideOrShowLetter(e, s, t = !0, a = !1) {
    a ? this.makeHidden(e) : this.makeVisible(e), e.nextElementSibling ? this.runAfter(this.lettersDelay, () => this.hideOrShowLetter(e.nextElementSibling, s, t, a)) : t && this.runAfter(this.holdDelay, () => this.next(a ? this.getNextWord(s) : s));
  }
  splitIntoSingleLetters(e) {
    const s = [];
    for (const t of e.childNodes)
      if (t.nodeType === Node.TEXT_NODE) {
        const a = t.textContent.split("");
        for (let n in a) {
          const l = document.createElement("span");
          l.innerHTML = a[n], s.push(l);
        }
      } else t.nodeType === Node.ELEMENT_NODE ? s.push(t) : console.warn("unsupported child node:", t);
    s.forEach((t) => {
      t.classList.add(this.letterClassName), e.hasAttribute("hidden") && t.setAttribute("hidden", "");
    }), e.innerHTML = s.map((t) => t.outerHTML).join(""), e.style.opacity = "1";
  }
}
customElements.define("via-animated-letters-headline", d);
class b extends h {
  revealDelay = 600;
  connectedCallback() {
    super.connectedCallback(), this.revealDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.revealDelay;
  }
  resize() {
    this.style.width = String(this.offsetWidth + 10);
  }
  showWord(e) {
    let s = e.parentNode.animate([{ width: "2px" }, { width: e.offsetWidth + "px" }], { duration: this.revealDelay });
    s.onfinish = (t) => this.runAfter(this.holdDelay, () => this.next(e));
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const s = this.getNextWord(e);
    let t = e.parentNode.animate([{ width: e.offsetWidth + "px" }, { width: "2px" }], { duration: this.revealDelay });
    t.onfinish = (a) => {
      this.switchWord(e, s), this.showWord(s);
    };
  }
}
customElements.define("via-animated-clip-headline", b);
const o = "http://www.w3.org/2000/svg", C = "0 0 500 150", c = {
  underline: [
    "M8 130 C104 116 206 112 308 116 C374 118 438 122 492 130"
  ],
  "double-underline": [
    "M10 126 C110 114 218 110 322 114 C388 116 446 120 490 126",
    "M34 144 C128 135 232 131 330 133 C388 134 436 137 468 142"
  ],
  scribble: [
    "M10 128 C44 112 70 140 104 124 C138 108 164 136 198 120 C232 104 258 132 292 116 C326 100 352 128 386 112 C420 96 446 124 490 110"
  ],
  circle: [
    "M268 14 C150 10 30 36 20 74 C12 108 110 136 244 140 C372 144 482 118 484 80 C486 44 384 16 252 14 C214 14 182 18 152 26"
  ],
  zigzag: [
    "M10 136 L48 116 L86 136 L124 116 L162 136 L200 116 L238 136 L276 116 L314 136 L352 116 L390 136 L428 116 L466 136 L490 124"
  ],
  strikethrough: [
    "M10 74 C120 62 250 60 376 64 C420 66 460 70 492 76"
  ],
  "cross-out": [
    "M486 22 C372 48 220 86 96 114 C68 120 40 126 14 132",
    "M16 24 C130 48 282 86 406 116 C434 122 462 128 486 134"
  ],
  diagonal: [
    "M474 20 C372 48 234 88 118 118 C88 126 58 132 26 136"
  ],
  box: [
    "M20 22 C160 12 338 12 482 20 C490 60 490 96 482 132 C340 142 160 142 18 132 C10 96 10 58 20 22"
  ],
  brackets: [
    "M74 14 C40 16 22 22 18 34 C12 62 12 92 18 118 C22 132 42 138 76 138",
    "M426 14 C460 16 478 22 482 34 C488 62 488 92 482 118 C478 132 458 138 424 138"
  ],
  arc: [
    "M12 104 C86 146 220 160 338 150 C410 144 466 126 492 92"
  ],
  wave: [
    "M8 120 C32 100 56 140 80 120 C104 100 128 140 152 120 C176 100 200 140 224 120 C248 100 272 140 296 120 C320 100 344 140 368 120 C392 100 416 140 440 120 C464 100 480 132 494 118"
  ],
  marker: [
    "M16 88 C140 70 320 68 484 80"
  ],
  "corner-ticks": [
    "M16 48 L16 16 L58 16",
    "M442 16 L484 16 L484 48",
    "M484 102 L484 134 L442 134",
    "M58 134 L16 134 L16 102"
  ]
}, f = "underline";
class g extends h {
  loopingClassName = "is-looping";
  connectedCallback() {
    this.decorateWords(), super.connectedCallback();
  }
  /**
   * A single phrase has nothing to rotate to, so the stylesheet loops the
   * drawing instead of the element switching words.
   */
  start() {
    this.isSinglePhrase() || super.start();
  }
  isSinglePhrase() {
    return this.querySelectorAll(this.wordSelector).length < 2;
  }
  decorateWords() {
    const e = this.getAttribute("shape") ?? f, s = c[e];
    if (s === void 0) {
      console.warn(
        'unknown highlight shape "' + e + '" (must be one of ' + Object.keys(c) + ")"
      );
      return;
    }
    this.isSinglePhrase() && this.classList.add(this.loopingClassName), this.querySelectorAll(this.wordSelector).forEach((t) => this.drawShape(t, s));
  }
  drawShape(e, s) {
    if (e.querySelector("svg") !== null)
      return;
    const t = document.createElementNS(o, "svg");
    t.setAttribute("viewBox", C), t.setAttribute("preserveAspectRatio", "none"), t.setAttribute("aria-hidden", "true"), t.setAttribute("focusable", "false"), s.forEach((a) => {
      const n = document.createElementNS(o, "path");
      n.setAttribute("d", a), n.setAttribute("pathLength", "100"), t.appendChild(n);
    }), e.appendChild(t);
  }
}
customElements.define("via-animated-highlight-headline", g);
class L extends h {
  #e = "is-loading";
  barDelay = 500;
  connectedCallback() {
    super.connectedCallback(), this.barDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.barDelay, this.runAfter(this.barDelay, () => this.classList.add(this.#e));
  }
  next(e = null) {
    super.next(e), e = e ?? this.current(), e !== null && (e.parentNode.classList.remove(this.#e), this.runAfter(this.barDelay, () => e.parentNode.classList.add(this.#e)));
  }
}
customElements.define("via-animated-loading-headline", L);
class y extends d {
  #e = "waiting";
  #t = "selected";
  selectionDuration = 500;
  connectedCallback() {
    super.connectedCallback(), this.selectionDuration = this.hasAttribute("selection") ? parseInt(this.getAttribute("selection")) : this.selectionDuration;
  }
  resize() {
  }
  showWord(e) {
    const s = this.current();
    this.showLetter(e.querySelector("." + this.letterClassName), e), this.makeVisible(e), r(this, "word-replaced", { old: s, new: e });
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const s = this.getNextWord(e), t = e.parentNode;
    t.classList.add(this.#t), t.classList.remove(this.#e), this.runAfter(this.selectionDuration, () => {
      t.classList.remove(this.#t), this.makeHidden(e), e.querySelectorAll("." + this.letterClassName).forEach((a) => this.makeHidden(a));
    }), this.runAfter(this.selectionDuration * 2, () => this.showWord(s));
  }
  showLetter(e, s, t = !0) {
    super.showLetter(e, s, t), e.nextElementSibling || this.runAfter(200, () => s.parentNode.classList.add(this.#e));
  }
}
customElements.define("via-animated-type-headline", y);
var u = /* @__PURE__ */ ((i) => (i.Blur = "blur", i.Bounce = "bounce", i.Clip = "clip", i.Glitch = "glitch", i.Highlight = "highlight", i.LoadingBar = "loading-bar", i.Push = "push", i.Rotate1 = "rotate-1", i.Rotate2 = "rotate-2", i.Rotate3 = "rotate-3", i.Scale = "scale", i.Slide = "slide", i.Type = "type", i.Wave = "wave", i.Zoom = "zoom", i))(u || {});
function v(i, e) {
  let s;
  switch (i) {
    case "clip":
      s = document.createElement("via-animated-clip-headline");
      break;
    case "loading-bar":
      s = document.createElement("via-animated-loading-headline");
      break;
    case "highlight":
      s = document.createElement("via-animated-highlight-headline");
      break;
    case "push":
    case "slide":
    case "rotate-1":
    case "zoom":
    case "blur":
    case "bounce":
    case "glitch":
      s = document.createElement("via-animated-words-headline");
      break;
    case "scale":
    case "rotate-2":
    case "rotate-3":
    case "wave":
      s = document.createElement("via-animated-letters-headline");
      break;
    case "type":
      s = document.createElement("via-animated-type-headline");
      break;
    default:
      throw new Error("invalid animation type " + i + " (must be one of " + Object.values(u) + ")");
  }
  return Array.from(e).forEach((t) => s.setAttribute(t.name, t.value)), s;
}
class E extends HTMLElement {
  static get observedAttributes() {
    return ["animation", "hold", "delay", "shape"];
  }
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    const e = this.getAttribute("animation"), s = v(e, this.attributes);
    Array.from(this.children).forEach((t) => {
      t.tagName?.startsWith("VIA-ANIMATED-") ? t.childNodes.forEach((a) => s.appendChild(a.cloneNode(!0))) : s.appendChild(t.cloneNode(!0));
    }), this.innerHTML = "", this.appendChild(s);
  }
}
customElements.define("via-animated-headline", E);
export {
  u as AnimationType
};
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Highlight annotations: a hand-drawn marker (underline, circle, scribble,
 * cross-out, ...) is drawn over the current word with an SVG stroke.
 *
 * Every path carries `pathLength="100"`, which normalises its length, so the
 * draw-on animation is a plain CSS keyframe (`stroke-dashoffset: 100 -> 0`)
 * and no JavaScript has to measure anything.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
