const l = (i, e, t, s = !1) => i.dispatchEvent(new CustomEvent(`via-animated-headline:${e}`, { bubbles: !0, cancelable: s, detail: t })), u = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function k(i, e, t) {
  let s = performance.now();
  requestAnimationFrame(function a(n) {
    let r = (n - s) / t;
    r > 1 && (r = 1);
    let h = i(r);
    e(h), r < 1 && requestAnimationFrame(a);
  });
}
class c extends HTMLElement {
  #e = !1;
  holdDelay = 2500;
  wordSelector = "b";
  leavingClassName = "is-leaving";
  connectedCallback() {
    this.holdDelay = this.hasAttribute("hold") ? parseInt(this.getAttribute("hold")) : this.holdDelay, this.resize(), window.matchMedia("(prefers-reduced-motion: reduce)").matches || this.start(), l(this, "ready");
  }
  attributeChangedCallback() {
    this.resize();
  }
  resize() {
    let e = 0;
    this.querySelectorAll(this.wordSelector).forEach(function(t) {
      const s = t, a = s.hasAttribute("hidden");
      a && (s.style.display = "inline-block", s.style.position = "absolute", s.style.visibility = "hidden", s.style.whiteSpace = "nowrap"), e = Math.max(s.offsetWidth, e), a && (s.style.removeProperty("display"), s.style.removeProperty("position"), s.style.removeProperty("visibility"), s.style.removeProperty("white-space"));
    }), this.style.width = e + "px", l(this, "resized", { width: e.toString() });
  }
  /** @api */
  start() {
    this.#e = !1, this.runAfter(this.holdDelay, () => this.next()), l(this, "started");
  }
  /** @api */
  stop() {
    this.#e = !0, l(this, "stopped");
  }
  /** @api */
  current() {
    return this.querySelector(this.wordSelector + ":not([hidden])") ?? this.querySelector(this.wordSelector);
  }
  // main logic
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e);
    this.switchWord(e, t), this.runAfter(this.holdDelay, () => this.next(t));
  }
  getNextWord(e) {
    return e.nextElementSibling ? e.nextElementSibling : e.parentNode.children[0];
  }
  switchWord(e, t) {
    this.makeHidden(e), this.makeVisible(t), this.markLeaving(e), l(this, "word-replaced", { old: e, new: t });
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
  runAfter(e, t) {
    k((s) => s, (s) => {
      if (this.#e)
        throw "execution aborted";
      s === 1 && t();
    }, e);
  }
}
customElements.define("via-animated-words-headline", c);
class m extends c {
  lettersDelay = 50;
  letterClassName = "letter";
  connectedCallback() {
    super.connectedCallback(), this.lettersDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.lettersDelay, this.querySelectorAll(this.wordSelector).forEach(this.splitIntoSingleLetters, this);
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e), s = e.querySelectorAll("." + this.letterClassName).length >= t.querySelectorAll("." + this.letterClassName).length;
    this.hideLetter(e.querySelector("." + this.letterClassName), e, s), this.showLetter(t.querySelector("." + this.letterClassName), t, !s), this.switchWord(e, t);
  }
  hideLetter(e, t, s) {
    this.hideOrShowLetter(e, t, s, !0);
  }
  showLetter(e, t, s) {
    this.hideOrShowLetter(e, t, s, !1);
  }
  hideOrShowLetter(e, t, s = !0, a = !1) {
    a ? this.makeHidden(e) : this.makeVisible(e), e.nextElementSibling ? this.runAfter(this.lettersDelay, () => this.hideOrShowLetter(e.nextElementSibling, t, s, a)) : s && this.runAfter(this.holdDelay, () => this.next(a ? this.getNextWord(t) : t));
  }
  splitIntoSingleLetters(e) {
    const t = [];
    for (const s of e.childNodes)
      if (s.nodeType === Node.TEXT_NODE) {
        const a = s.textContent.split("");
        for (let n in a) {
          const r = document.createElement("span");
          r.innerHTML = a[n], t.push(r);
        }
      } else s.nodeType === Node.ELEMENT_NODE ? t.push(s) : console.warn("unsupported child node:", s);
    t.forEach((s) => {
      s.classList.add(this.letterClassName), e.hasAttribute("hidden") && s.setAttribute("hidden", "");
    }), e.innerHTML = t.map((s) => s.outerHTML).join(""), e.style.opacity = "1";
  }
}
customElements.define("via-animated-letters-headline", m);
class v extends c {
  revealDelay = 600;
  connectedCallback() {
    super.connectedCallback(), this.revealDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.revealDelay;
  }
  resize() {
    this.style.width = String(this.offsetWidth + 10);
  }
  showWord(e) {
    let t = e.parentNode.animate([{ width: "2px" }, { width: e.offsetWidth + "px" }], { duration: this.revealDelay });
    t.onfinish = (s) => this.runAfter(this.holdDelay, () => this.next(e));
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e);
    let s = e.parentNode.animate([{ width: e.offsetWidth + "px" }, { width: "2px" }], { duration: this.revealDelay });
    s.onfinish = (a) => {
      this.switchWord(e, t), this.showWord(t);
    };
  }
}
customElements.define("via-animated-clip-headline", v);
class A extends v {
  waitingClassName = "waiting";
  showWord(e) {
    const t = this.animate(
      [{ width: "2px" }, { width: e.offsetWidth + "px" }],
      { duration: this.revealDelay }
    );
    t.onfinish = () => {
      this.classList.add(this.waitingClassName), this.runAfter(this.holdDelay, () => this.next(e));
    };
  }
  next(e = null) {
    this.classList.remove(this.waitingClassName), super.next(e);
  }
}
customElements.define("via-animated-clip-caret-headline", A);
const b = "http://www.w3.org/2000/svg", L = "0 0 500 150", g = {
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
  // One continuous pen stroke that sweeps right, doubles back and sweeps
  // again, the way an underline gets scrubbed in by hand.
  zigzag: [
    "M10 126 C140 118 320 116 492 122 C370 130 180 132 26 140 C160 136 330 136 480 140 C420 145 360 147 300 148"
  ],
  // The hard-edged variant, for when the sketchy one is too loose.
  sawtooth: [
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
  // An underline that lands and then throws off two twinkles. The stars are
  // filled rather than stroked, so they pop into place instead of being
  // drawn (a dash offset only ever reveals a stroke).
  // The box is stretched to the word and the viewBox is far wider than it is
  // tall, so the twinkles are drawn wider than tall to come out roughly
  // square once that squash is applied.
  spark: [
    "M10 128 C120 116 300 112 490 122",
    "M455 0 Q461 19 497 24 Q461 29 455 48 Q449 29 413 24 Q449 19 455 0 Z",
    "M48 8 Q52 23 78 26 Q52 29 48 44 Q44 29 18 26 Q44 23 48 8 Z"
  ],
  "corner-ticks": [
    "M16 48 L16 16 L58 16",
    "M442 16 L484 16 L484 48",
    "M484 102 L484 134 L442 134",
    "M58 134 L16 134 L16 102"
  ]
}, S = "underline";
function y(i, e) {
  const t = g[e];
  if (t === void 0) {
    console.warn(
      'unknown highlight shape "' + e + '" (must be one of ' + Object.keys(g) + ")"
    );
    return;
  }
  if (i.querySelector("svg") !== null)
    return;
  const s = document.createElementNS(b, "svg");
  s.setAttribute("viewBox", L), s.setAttribute("preserveAspectRatio", "none"), s.setAttribute("aria-hidden", "true"), s.setAttribute("focusable", "false"), t.forEach((a) => {
    const n = document.createElementNS(b, "path");
    n.setAttribute("d", a), n.setAttribute("pathLength", "100"), s.appendChild(n);
  }), i.appendChild(s);
}
class w extends c {
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
    const e = this.getAttribute("shape") ?? S;
    this.isSinglePhrase() && this.classList.add(this.loopingClassName), this.querySelectorAll(this.wordSelector).forEach((t) => y(t, e));
  }
}
customElements.define("via-animated-highlight-headline", w);
const N = "marker";
class M extends A {
  connectedCallback() {
    const e = this.getAttribute("shape") ?? N;
    this.querySelectorAll(this.wordSelector).forEach((t) => y(t, e)), super.connectedCallback();
  }
}
customElements.define("via-animated-marker-caret-headline", M);
const C = "http://www.w3.org/2000/svg", D = "M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z", W = 7;
function d(i, e) {
  return i + Math.random() * (e - i);
}
class F extends c {
  sparkleClassName = "sparkle";
  connectedCallback() {
    const e = this.hasAttribute("sparkles") ? parseInt(this.getAttribute("sparkles")) : W;
    this.querySelectorAll(this.wordSelector).forEach((t) => this.scatter(t, e)), super.connectedCallback();
  }
  scatter(e, t) {
    if (e.querySelector("." + this.sparkleClassName) === null)
      for (let s = 0; s < t; s++)
        e.appendChild(this.sparkle(s, t));
  }
  sparkle(e, t) {
    const s = document.createElementNS(C, "svg");
    s.setAttribute("viewBox", "0 0 24 24"), s.setAttribute("aria-hidden", "true"), s.setAttribute("focusable", "false"), s.setAttribute("class", this.sparkleClassName);
    const a = d(9, 19), n = (e + d(0.15, 0.85)) / t;
    s.style.setProperty("--sparkle-size", a.toFixed(1) + "px"), s.style.setProperty("--sparkle-x", (n * 100).toFixed(1) + "%"), s.style.setProperty("--sparkle-y", d(-22, 92).toFixed(1) + "%"), s.style.setProperty("--sparkle-delay", d(0, 1.6).toFixed(2) + "s"), s.style.setProperty("--sparkle-duration", d(1.1, 2.1).toFixed(2) + "s"), s.style.setProperty("--sparkle-turn", d(-40, 40).toFixed(0) + "deg");
    const r = document.createElementNS(C, "path");
    return r.setAttribute("d", D), s.appendChild(r), s;
  }
}
customElements.define("via-animated-sparkle-headline", F);
class q extends c {
  #e = "is-loading";
  barDelay = 500;
  connectedCallback() {
    super.connectedCallback(), this.barDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.barDelay, this.runAfter(this.barDelay, () => this.classList.add(this.#e));
  }
  next(e = null) {
    super.next(e), e = e ?? this.current(), e !== null && (e.parentNode.classList.remove(this.#e), this.runAfter(this.barDelay, () => e.parentNode.classList.add(this.#e)));
  }
}
customElements.define("via-animated-loading-headline", q);
class H extends m {
  #e = "waiting";
  #t = "selected";
  selectionDuration = 500;
  connectedCallback() {
    super.connectedCallback(), this.selectionDuration = this.hasAttribute("selection") ? parseInt(this.getAttribute("selection")) : this.selectionDuration;
  }
  resize() {
  }
  showWord(e) {
    const t = this.current();
    this.showLetter(e.querySelector("." + this.letterClassName), e), this.makeVisible(e), l(this, "word-replaced", { old: t, new: e });
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e), s = e.parentNode;
    s.classList.add(this.#t), s.classList.remove(this.#e), this.runAfter(this.selectionDuration, () => {
      s.classList.remove(this.#t), this.makeHidden(e), e.querySelectorAll("." + this.letterClassName).forEach((a) => this.makeHidden(a));
    }), this.runAfter(this.selectionDuration * 2, () => this.showWord(t));
  }
  showLetter(e, t, s = !0) {
    super.showLetter(e, t, s), e.nextElementSibling || this.runAfter(200, () => t.parentNode.classList.add(this.#e));
  }
}
customElements.define("via-animated-type-headline", H);
class I extends m {
  waitingClassName = "waiting";
  /** Backspacing is quicker than typing, the way it is for a real typist. */
  eraseDelay = 40;
  connectedCallback() {
    super.connectedCallback(), this.eraseDelay = this.hasAttribute("erase") ? parseInt(this.getAttribute("erase")) : Math.max(20, Math.round(this.lettersDelay * 0.6));
    const e = this.current();
    e !== null && this.typeWord(e, !1);
  }
  resize() {
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = e.querySelectorAll("." + this.letterClassName);
    t.length !== 0 && (this.classList.remove(this.waitingClassName), this.eraseLetter(t[t.length - 1], e));
  }
  /** Walks backwards through the phrase, hiding one character per tick. */
  eraseLetter(e, t) {
    this.makeHidden(e);
    const s = e.previousElementSibling;
    if (s !== null) {
      this.runAfter(this.eraseDelay, () => this.eraseLetter(s, t));
      return;
    }
    const a = this.getNextWord(t);
    this.switchWord(t, a), this.typeWord(a);
  }
  typeWord(e, t = !0) {
    const s = e.querySelectorAll("." + this.letterClassName);
    s.length !== 0 && (s.forEach((a) => this.makeHidden(a)), this.makeVisible(e), this.typeLetter(s[0], e, t));
  }
  typeLetter(e, t, s) {
    this.makeVisible(e);
    const a = e.nextElementSibling;
    if (a !== null) {
      this.runAfter(this.lettersDelay, () => this.typeLetter(a, t, s));
      return;
    }
    this.classList.add(this.waitingClassName), s && this.runAfter(this.holdDelay, () => this.next(t));
  }
}
customElements.define("via-animated-type-delete-headline", I);
const P = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&@*?", O = 900;
class z extends m {
  steps = 7;
  tickDuration = 45;
  charset = P;
  connectedCallback() {
    super.connectedCallback(), this.steps = this.hasAttribute("steps") ? parseInt(this.getAttribute("steps")) : this.steps, this.tickDuration = this.hasAttribute("tick") ? parseInt(this.getAttribute("tick")) : this.tickDuration, this.charset = this.getAttribute("charset") || this.charset, this.querySelectorAll("." + this.letterClassName).forEach((e) => {
      const t = e;
      t.classList.toggle("space", (t.textContent ?? "").trim() === ""), t.children.length === 0 && (t.dataset.char ??= t.textContent ?? "", t.textContent = t.dataset.char);
    });
  }
  /**
   * The base class drops the leaving phrase's marker on the very first
   * `animationend`, which would cut the exit short for every letter that has
   * not been hidden yet. Hold it until the last letter has had its turn.
   */
  markLeaving(e) {
    const t = e.querySelectorAll("." + this.letterClassName).length;
    e.classList.add(this.leavingClassName), window.setTimeout(() => e.classList.remove(this.leavingClassName), t * this.lettersDelay + O);
  }
  hideOrShowLetter(e, t, s = !0, a = !1) {
    super.hideOrShowLetter(e, t, s, a), !a && this.getAttribute("animation") === "shuffle" && this.shuffle(e);
  }
  shuffle(e) {
    const t = e.dataset.char;
    !t || t.trim() === "" || u() || requestAnimationFrame(() => {
      e.style.width = e.getBoundingClientRect().width + "px", e.classList.add("is-shuffling");
      const s = this.steps + Math.floor(Math.random() * 3);
      let a = 0;
      const n = () => {
        if (a++ >= s) {
          e.textContent = t, e.classList.remove("is-shuffling"), e.style.removeProperty("width");
          return;
        }
        e.textContent = this.charset.charAt(Math.floor(Math.random() * this.charset.length)), window.setTimeout(n, this.tickDuration);
      };
      n();
    });
  }
}
customElements.define("via-animated-stagger-headline", z);
class R extends c {
  connectedCallback() {
    this.querySelectorAll(this.wordSelector).forEach((e) => {
      e.dataset.text = e.textContent ?? "";
    }), super.connectedCallback();
  }
}
customElements.define("via-animated-mirror-headline", R);
const _ = 700;
function o(i, e = 2) {
  return String(Math.max(0, Math.floor(i))).padStart(e, "0");
}
class p extends HTMLElement {
  shown = [];
  label = "";
  timer;
  connectedCallback() {
    this.setAttribute("role", "timer"), this.setAttribute("aria-live", "off"), this.begin(), l(this, "ready");
  }
  disconnectedCallback() {
    this.end();
  }
  attributeChangedCallback(e) {
    this.isConnected && (this.end(), this.begin());
  }
  /** Stop ticking and release timers. */
  end() {
    window.clearTimeout(this.timer), this.timer = void 0;
  }
  number(e, t) {
    const s = parseFloat(this.getAttribute(e) ?? "");
    return Number.isFinite(s) ? s : t;
  }
  /** Boolean attribute that can be switched off with `name="false"`. */
  flag(e, t) {
    return this.hasAttribute(e) ? this.getAttribute(e) !== "false" : t;
  }
  /**
   * Write `text` into the slots.
   *
   * Characters from index `instantFrom` on are swapped without rolling -
   * meant for values that change too fast to be read as motion, such as the
   * frames of a timecode.
   */
  display(e, t = 1 / 0) {
    const s = Array.from(e);
    if (s.length !== this.shown.length)
      this.rebuild(s);
    else {
      const a = !u();
      s.forEach((n, r) => {
        if (n === this.shown[r])
          return;
        const h = this.children[r];
        this.classify(h, n), a && r < t ? this.roll(h, n) : h.textContent = n;
      });
    }
    this.shown = s, this.announce(s.slice(0, t).join(""));
  }
  rebuild(e) {
    this.textContent = "", e.forEach((t) => {
      const s = document.createElement("span");
      s.setAttribute("aria-hidden", "true"), this.classify(s, t), s.textContent = t, this.appendChild(s);
    });
  }
  classify(e, t) {
    e.className = "ah-char " + (/\d/.test(t) ? "is-digit" : /\s/.test(t) ? "is-space" : /[:.,]/.test(t) ? "is-sep" : "is-text");
  }
  roll(e, t) {
    for (; e.childNodes.length > 1; )
      e.removeChild(e.firstChild);
    const s = document.createElement("span");
    s.className = "ah-face is-out", s.textContent = e.textContent;
    const a = document.createElement("span");
    a.className = "ah-face is-in", a.textContent = t, e.textContent = "", e.append(s, a);
    const n = () => s.remove();
    s.addEventListener("animationend", n, { once: !0 }), window.setTimeout(n, _);
  }
  announce(e) {
    e = e.replace(/[:.\s]+$/, ""), e !== this.label && (this.label = e, this.setAttribute("aria-label", e));
  }
}
class T extends p {
  static get observedAttributes() {
    return ["timezone", "format", "seconds"];
  }
  formatter;
  begin() {
    const t = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: this.getAttribute("format") === "12h" ? "h12" : "h23"
    };
    try {
      this.formatter = new Intl.DateTimeFormat("en-US", { ...t, timeZone: this.getAttribute("timezone") || void 0 });
    } catch {
      console.warn('invalid time zone "' + this.getAttribute("timezone") + '", using the local one'), this.formatter = new Intl.DateTimeFormat("en-US", t);
    }
    this.tick();
  }
  tick() {
    const e = /* @__PURE__ */ new Date();
    this.display(this.format(e)), l(this, "tick", { date: e }), this.timer = window.setTimeout(() => this.tick(), 1e3 - e.getMilliseconds() + 4);
  }
  format(e) {
    const t = {};
    this.formatter.formatToParts(e).forEach((n) => t[n.type] = n.value);
    let a = (t.hour === "24" ? o(0) : t.hour) + ":" + t.minute;
    return this.flag("seconds", !0) && (a += ":" + t.second), this.getAttribute("format") === "12h" && (a += " " + t.dayPeriod), a;
  }
}
customElements.define("via-animated-clock", T);
class B extends p {
  static get observedAttributes() {
    return ["target", "format"];
  }
  completed = !1;
  begin() {
    this.completed = !1, this.removeAttribute("complete"), this.tick();
  }
  target() {
    const e = this.getAttribute("target") ?? "";
    return /^\d+$/.test(e) ? parseInt(e) : Date.parse(e);
  }
  tick() {
    const e = this.target();
    if (Number.isNaN(e)) {
      console.warn('via-animated-countdown needs a valid "target" date'), this.display(this.format(0));
      return;
    }
    const t = Math.max(0, e - Date.now()), s = Math.ceil(t / 1e3);
    if (this.display(this.format(s)), l(this, "tick", { remaining: s }), t === 0) {
      this.completed = !0, this.setAttribute("complete", ""), l(this, "complete");
      return;
    }
    this.timer = window.setTimeout(() => this.tick(), t - (s - 1) * 1e3 + 4);
  }
  format(e) {
    const t = Math.floor(e / 86400), s = Math.floor(e / 3600) % 24, a = Math.floor(e / 60) % 60, n = e % 60;
    switch (this.getAttribute("format")) {
      case "labeled":
        return `${o(t)}d ${o(s)}h ${o(a)}m ${o(n)}s`;
      case "minimal":
        if (t === 0)
          return [s, a, n].map((r) => o(r)).join(":");
      // fall through: with days left, minimal is the compact notation
      default:
        return [t, s, a, n].map((r) => o(r)).join(":");
    }
  }
}
customElements.define("via-animated-countdown", B);
const E = 24 * 3600;
class V extends p {
  static get observedAttributes() {
    return ["start", "fps", "format", "paused"];
  }
  fps = 30;
  /** Frames that had already been counted when the clock was last (re)started. */
  base = 0;
  since = 0;
  frame;
  lastSecond = -1;
  /** @api jump back to the start value */
  reset() {
    this.end(), this.begin();
  }
  begin() {
    this.fps = Math.max(1, Math.round(this.number("fps", 30))), this.base = this.parse(this.getAttribute("start") ?? ""), this.since = performance.now(), this.lastSecond = -1, this.render(), !this.hasAttribute("paused") && !u() && (this.frame = requestAnimationFrame(() => this.loop()));
  }
  end() {
    super.end(), cancelAnimationFrame(this.frame), this.frame = void 0;
  }
  attributeChangedCallback(e) {
    if (e !== "paused" || !this.isConnected)
      return super.attributeChangedCallback(e);
    this.hasAttribute("paused") ? (this.base = this.frames(), this.end()) : (this.since = performance.now(), this.frame = requestAnimationFrame(() => this.loop()));
  }
  loop() {
    this.render(), this.frame = requestAnimationFrame(() => this.loop());
  }
  frames() {
    const e = this.frame === void 0 ? 0 : (performance.now() - this.since) / 1e3 * this.fps;
    return this.base + Math.floor(e);
  }
  render() {
    const e = this.frames(), t = Math.floor(e / this.fps) % E, s = this.getAttribute("format") !== "compact", a = [t / 3600, t / 60 % 60, t % 60].map((n) => o(n)).join(":");
    s ? this.display(a + ":" + o(e % this.fps), a.length) : this.display(a), t !== this.lastSecond && (this.lastSecond = t, l(this, "tick", { second: t }));
  }
  /** "HH:MM:SS:FF" or "HH:MM:SS" to frames. */
  parse(e) {
    const t = e.split(":").map((h) => parseInt(h)).filter((h) => Number.isFinite(h));
    if (t.length === 0)
      return 0;
    const [s = 0, a = 0, n = 0, r = 0] = t.length >= 4 ? t : [...t, ...Array(4 - t.length).fill(0)];
    return ((s * 3600 + a * 60 + n) * this.fps + r) % (E * this.fps);
  }
}
customElements.define("via-animated-timecode", V);
const j = (i) => 1 - Math.pow(1 - i, 3);
class Q extends HTMLElement {
  static get observedAttributes() {
    return ["from", "to", "decimals", "prefix", "suffix", "locale", "bar"];
  }
  value = 0;
  frame;
  observer;
  played = !1;
  valueElement;
  prefixElement;
  suffixElement;
  barElement = null;
  connectedCallback() {
    this.build(), this.value = this.number("from", 0), this.paint(this.value);
    const e = this.getAttribute("trigger") ?? "view";
    e === "load" || e === "view" && !("IntersectionObserver" in window) ? this.play() : e === "view" && (this.observer = new IntersectionObserver((t) => {
      t.some((s) => s.isIntersecting) && (this.observer?.disconnect(), this.play());
    }, { threshold: 0.4 }), this.observer.observe(this)), l(this, "ready");
  }
  disconnectedCallback() {
    cancelAnimationFrame(this.frame), this.observer?.disconnect();
  }
  attributeChangedCallback(e) {
    !this.isConnected || this.valueElement === void 0 || (e === "bar" && this.build(), e === "to" && this.played ? this.run(this.value, this.number("to", 100)) : this.paint(this.value));
  }
  /** @api count from `from` to `to` (again, if it already ran) */
  play() {
    this.played = !0, this.run(this.number("from", 0), this.number("to", 100));
  }
  number(e, t) {
    const s = parseFloat(this.getAttribute(e) ?? "");
    return Number.isFinite(s) ? s : t;
  }
  build() {
    const e = this.hasAttribute("bar") && this.getAttribute("bar") !== "false";
    if (this.valueElement === void 0) {
      this.textContent = "", this.prefixElement = document.createElement("span"), this.prefixElement.className = "ah-affix", this.valueElement = document.createElement("span"), this.valueElement.className = "ah-value", this.suffixElement = document.createElement("span"), this.suffixElement.className = "ah-affix";
      const t = document.createElement("span");
      t.className = "ah-text", t.setAttribute("aria-hidden", "true"), t.append(this.prefixElement, this.valueElement, this.suffixElement), this.appendChild(t);
    }
    e && this.barElement === null ? (this.barElement = document.createElement("span"), this.barElement.className = "ah-bar", this.barElement.setAttribute("aria-hidden", "true"), this.barElement.appendChild(document.createElement("i")), this.appendChild(this.barElement)) : !e && this.barElement !== null && (this.barElement.remove(), this.barElement = null);
  }
  run(e, t) {
    cancelAnimationFrame(this.frame), this.classList.remove("is-landed");
    const s = Math.max(0, this.number("duration", 1800));
    if (u() || s === 0 || e === t)
      return this.land(t);
    const a = performance.now(), n = (r) => {
      const h = Math.min(1, (r - a) / s);
      this.paint(e + (t - e) * j(h)), h < 1 ? this.frame = requestAnimationFrame(n) : this.land(t);
    };
    this.frame = requestAnimationFrame(n);
  }
  land(e) {
    this.paint(e), this.classList.add("is-landed"), l(this, "complete", { value: e });
  }
  paint(e) {
    this.value = e;
    const t = Math.max(0, Math.round(this.number("decimals", 0)));
    this.prefixElement.textContent = this.getAttribute("prefix") ?? "", this.valueElement.textContent = this.format(e, t), this.suffixElement.textContent = this.getAttribute("suffix") ?? "", this.setAttribute("aria-label", (this.getAttribute("prefix") ?? "") + this.format(this.number("to", 100), t) + (this.getAttribute("suffix") ?? ""));
    const s = this.number("from", 0), a = this.number("to", 100), n = a === s ? 1 : (e - s) / (a - s);
    this.style.setProperty("--ah-progress", Math.min(1, Math.max(0, n)).toFixed(4));
  }
  format(e, t) {
    try {
      return new Intl.NumberFormat(this.getAttribute("locale") || void 0, {
        minimumFractionDigits: t,
        maximumFractionDigits: t
      }).format(e);
    } catch {
      return e.toFixed(t);
    }
  }
}
customElements.define("via-animated-progress", Q);
var x = /* @__PURE__ */ ((i) => (i.Blur = "blur", i.Bounce = "bounce", i.Clip = "clip", i.ClipCaret = "clip-caret", i.Glitch = "glitch", i.Highlight = "highlight", i.LoadingBar = "loading-bar", i.MarkerCaret = "marker-caret", i.Mirror = "mirror", i.Pop = "pop", i.Push = "push", i.Rise = "rise", i.Roll = "roll", i.Rolling = "rolling", i.Rotate1 = "rotate-1", i.Rotate2 = "rotate-2", i.Rotate3 = "rotate-3", i.Scale = "scale", i.Shuffle = "shuffle", i.Slide = "slide", i.Sparkle = "sparkle", i.Type = "type", i.TypeDelete = "type-delete", i.Wave = "wave", i.Zoom = "zoom", i))(x || {});
function U(i, e) {
  let t;
  switch (i) {
    case "clip":
      t = document.createElement("via-animated-clip-headline");
      break;
    case "clip-caret":
      t = document.createElement("via-animated-clip-caret-headline");
      break;
    case "loading-bar":
      t = document.createElement("via-animated-loading-headline");
      break;
    case "highlight":
      t = document.createElement("via-animated-highlight-headline");
      break;
    case "marker-caret":
      t = document.createElement("via-animated-marker-caret-headline");
      break;
    case "sparkle":
      t = document.createElement("via-animated-sparkle-headline");
      break;
    case "mirror":
      t = document.createElement("via-animated-mirror-headline");
      break;
    case "rise":
    case "pop":
    case "roll":
    case "rolling":
    case "shuffle":
      t = document.createElement("via-animated-stagger-headline");
      break;
    case "push":
    case "slide":
    case "rotate-1":
    case "zoom":
    case "blur":
    case "bounce":
    case "glitch":
      t = document.createElement("via-animated-words-headline");
      break;
    case "scale":
    case "rotate-2":
    case "rotate-3":
    case "wave":
      t = document.createElement("via-animated-letters-headline");
      break;
    case "type":
      t = document.createElement("via-animated-type-headline");
      break;
    case "type-delete":
      t = document.createElement("via-animated-type-delete-headline");
      break;
    default:
      throw new Error("invalid animation type " + i + " (must be one of " + Object.values(x) + ")");
  }
  return Array.from(e).forEach((s) => t.setAttribute(s.name, s.value)), t;
}
class $ extends HTMLElement {
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
    const e = this.getAttribute("animation"), t = U(e, this.attributes);
    Array.from(this.children).forEach((s) => {
      s.tagName?.startsWith("VIA-ANIMATED-") ? s.childNodes.forEach((a) => t.appendChild(a.cloneNode(!0))) : t.appendChild(s.cloneNode(!0));
    }), this.innerHTML = "", this.appendChild(t);
  }
}
customElements.define("via-animated-headline", $);
var f = /* @__PURE__ */ ((i) => (i.Clock = "clock", i.Countdown = "countdown", i.Progress = "progress", i.Timecode = "timecode", i))(f || {});
class G extends HTMLElement {
  static get observedAttributes() {
    return ["animation"];
  }
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    const e = this.getAttribute("animation");
    if (!Object.values(f).includes(e))
      throw new Error("invalid counter type " + e + " (must be one of " + Object.values(f) + ")");
    const t = document.createElement("via-animated-" + e);
    Array.from(this.attributes).forEach((s) => t.setAttribute(s.name, s.value)), this.innerHTML = "", this.appendChild(t);
  }
}
customElements.define("via-animated-counter", G);
export {
  x as AnimationType,
  f as CounterType
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
 * Clip reveal with a terminal caret: the phrase is wiped in behind the bar,
 * and while it is being held the bar blinks instead of standing still.
 *
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
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * A highlighter that collapses and reopens between phrases: the marker (and
 * the word under it) is wiped back to the caret, the phrase is swapped behind
 * it, and the ink grows out again at the width of the new word.
 *
 * @author Christoph Massmann <cm@vianetz,com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Sparkles: the phrase arrives with a scatter of four-pointed twinkles that
 * pop in and out around it.
 *
 * The positions, sizes and offsets are rolled once, when the element is set
 * up, and handed to CSS as inline values - so the twinkling itself costs no
 * JavaScript at all.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Typewriter that backspaces: the phrase is typed out, held, then erased one
 * character at a time before the next one is typed in its place.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
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
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Mirror: the phrase arrives flanked by two ghost copies that close in from
 * opposite sides and merge into it, like a reflection snapping into place.
 *
 * The ghosts are pseudo-elements that read the phrase from `data-text`, which
 * is all this class has to provide.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Shared base of the counter family (clock, countdown, timecode): the value
 * is shown as one slot per character, and when the value changes only the
 * slots whose character actually changed roll - the new glyph rises in from
 * below while the old one lifts out through the top.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Clock: the current time, in any IANA time zone, in 12 or 24 hour notation.
 * Only the digits that moved roll; the separators breathe on their own beat.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Countdown to a moment in time. Rolls only the digits that changed, stops at
 * zero (never goes negative) and announces itself with `complete`.
 *
 * Formats: `labeled` (12d 03h 45m 12s), `compact` (12:03:45:12) and `minimal`
 * (compact, but the days drop out once they reach zero).
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Timecode: a running SMPTE-style counter (HH:MM:SS:FF) that ticks in frames.
 * Hours, minutes and seconds roll; the frame digits change too fast to be read
 * as motion, so they simply flip.
 *
 * Driven by `requestAnimationFrame` and the clock, not by an interval, so it
 * stays frame-accurate and does not drift.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * Progress: counts a number up (or down) to its target with an ease-out that
 * lands softly without overshooting, optionally drawing a bar underneath that
 * fills at the same pace.
 *
 * It plays once when it scrolls into view (`trigger="view"`, the default), on
 * load (`trigger="load"`), or when `play()` is called (`trigger="manual"`).
 * Changing `to` afterwards counts on from wherever the number currently is.
 *
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
