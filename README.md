# Animated Headlines Web Component

Animated Headlines with interchangeable words that replace one another through CSS transitions.  

![Demo](demo.gif)  
See [demo](https://vianetz.github.io/animated-headlines-vanilla/).


## Installation

### npm

```bash
npm install @vianetz/animated-headlines-vanilla
```

## Default Usage

Include the CSS and JavaScript in your head:

```html
<link rel="stylesheet" src="dist/animated-headline.css">
<script src="dist/animated-headline.js" defer></script>
```

Then use the following markup:

```html
<h1>
    My favorite food is
    <via-animated-headline animation="rotate-1">
        <b>pizza</b>
        <b hidden>sushi</b>
        <b hidden>steak</b>
    </span>
</h1>
```

## Advanced Usage

## Options

The Animated Headlines component provides multiple attributes to customize different animation settings depending on the type, e.g.:

| Option      | Description                                                                                                                                                                        |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `animation` | The animation effect, one of: `rotate-1`, `rotate-2`, `rotate-3`, `type`, `loading-bar`, `slide`, `clip`, `zoom`, `scale`, `push`, `blur`, `bounce`, `glitch`, `wave`, `clip-caret`, `type-delete`, `highlight`, `sparkle`, `marker-caret`, `rise`, `pop`, `roll`, `rolling`, `shuffle`, `mirror`, `flipboard` |
| `shape`     | Only for `animation="highlight"`: which marker to draw (see below). Defaults to `underline`                                                                                        |
| `erase`     | Only for `animation="type-delete"`: milliseconds between backspaces. Defaults to 60% of `delay`                                   |
| `steps`, `tick`, `charset` | Only for `animation="shuffle"`: how many random glyphs a letter cycles through (default 7), milliseconds per glyph (default 45), and the glyphs to draw from |
| `hold`      | Milliseconds to wait before starting a new animation cycle                                                                                                                         |
| `delay`     | Milliseconds to delay the effect, e.g. typing or rotating                                                                                                                          |

The options are set as html attributes on the custom component like this:
```html
<via-animated-headline animation="type" hold="3000" delay="1000">
```

See also [demo source](demo/index.html) for a full list of options for all types.

## Highlight annotations

`animation="highlight"` draws a hand-drawn marker over the current phrase. The
drawing is a stretched SVG whose paths carry `pathLength="100"`, so the draw-on
is a plain CSS keyframe and nothing has to be measured at runtime.

```html
<via-animated-headline animation="highlight" shape="circle">
    <b>right one</b>
</via-animated-headline>
```

A single `<b>` loops the drawing; several of them rotate as usual and the marker
is redrawn for every phrase.

Available shapes: `underline`, `double-underline`, `scribble`, `circle`,
`zigzag`, `sawtooth`, `strikethrough`, `cross-out`, `diagonal`, `box`,
`brackets`, `arc`, `wave`, `marker`, `corner-ticks`.

Everything is themed with custom properties, so no build step is needed to
restyle it:

| Property                   | Default   | Description                               |
|----------------------------|-----------|-------------------------------------------|
| `--ah-highlight-color`     | `#e63946` | Ink colour                                |
| `--ah-highlight-width`     | `7px`     | Pen width (kept even as the box stretches) |
| `--ah-draw-duration`       | `1.1s`    | How long one stroke takes to draw          |
| `--ah-draw-ease`           | `cubic-bezier(.65, 0, .35, 1)` | Easing of the stroke      |
| `--ah-draw-hold`           | `1.9s`    | Hold before a looping drawing restarts     |
| `--ah-highlight-bleed-x/y` | `0.35em` / `0.3em` | How far the drawing overshoots the word |

See [the highlight demo](demo/highlights.html) for all of them.

## Rotating letter effects

`rise`, `pop`, `roll`, `rolling`, `shuffle` and `mirror` rotate through the `<b>`
phrases like the others. Use `delay` to set the stagger between letters.

| Effect    | What it does                                                                                  | Custom properties                          |
|-----------|-----------------------------------------------------------------------------------------------|--------------------------------------------|
| `rise`    | Each letter climbs into place from below its baseline; the old phrase lifts away              | `--ah-rise-distance`                       |
| `pop`     | Letters slam in past their size and settle, with a comic starburst behind each                | `--ah-pop-burst`                           |
| `roll`    | Letters roll through a masked line-height window: old one out the top, new one in from below  |                                            |
| `rolling` | Letters tip over a 3D drum like a departure-board flap                                        | `--ah-rolling-depth`                       |
| `shuffle` | Slot machine: each letter flickers through random glyphs before landing on the real one       | `--ah-shuffle-color`                       |
| `flipboard` | Airport split-flap board: only the characters that differ flip, stepping through the alphabet left to right. `speed` (ms per flip, default 90), `delay` (ms between tiles, default 70), `steps` (max flips per tile, default 12), `charset` | `--ah-flipboard-bg/-fg/-split/-top-shade/-width/-height/-gap` |
| `mirror`  | Two ghost copies close in from opposite sides and merge into the phrase                       | `--ah-mirror-a/b`, `--ah-mirror-spread`    |

## Counters

A second family of elements shows numbers and time. Pick one with
`<via-animated-counter animation="...">`, or use the element directly (the
direct element is the one to use if you change attributes while it runs).
In `clock`, `countdown` and `timecode` only the digits that changed roll.

| Element                    | Attributes                                                                                                                                  |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `<via-animated-clock>`     | `timezone` (IANA name, default local), `format` (`24h` / `12h`), `seconds="false"` to hide seconds, `blink="false"` to keep the colons steady |
| `<via-animated-countdown>` | `target` (any date string or epoch ms), `format` (`compact` `DD:HH:MM:SS`, `labeled` `12d 03h 45m 12s`, `minimal` drops zero days). Freezes at zero, sets `complete`, fires `complete` |
| `<via-animated-timecode>`  | `fps` (default 30), `start` (`HH:MM:SS:FF`), `format` (`full` / `compact`), `paused`. `reset()` restarts. Frame digits flip instead of rolling |
| `<via-animated-progress>`  | `to`, `from`, `duration` (ms, default 1800), `decimals`, `prefix`, `suffix`, `locale`, `bar` (draws a bar), `trigger` (`view` default, `load`, `manual`). `play()` replays. Cubic ease-out, no overshoot |

Counters fire `via-animated-headline:ready`, `:tick` and, for countdown and
progress, `:complete`. See [the counters demo](demo/counters.html).

## Events

This web component emits the following events that you can listen to (should be rather self-explanatory):
- `via-animated-headline:ready`
- `via-animated-headline:resized`
- `via-animated-headline:started`
- `via-animated-headline:stopped`
- `via-animated-headline:word-replaced`

## License

Animated Headlines is open-sourced software licensed under the [MIT license](https://opensource.org/license/MIT).