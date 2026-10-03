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
| `animation` | The animation effect, one of: `rotate-1`, `rotate-2`, `rotate-3`, `type`, `loading-bar`, `slide`, `clip`, `zoom`, `scale`, `push`, `blur`, `bounce`, `glitch`, `wave`, `highlight` |
| `shape`     | Only for `animation="highlight"`: which marker to draw (see below). Defaults to `underline`                                                                                        |
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
| `--ah-draw-hold`           | `1.9s`    | Hold before a looping drawing restarts     |
| `--ah-highlight-bleed-x/y` | `0.35em` / `0.3em` | How far the drawing overshoots the word |

See [the highlight demo](demo/highlights.html) for all of them.

## Events

This web component emits the following events that you can listen to (should be rather self-explanatory):
- `via-animated-headline:ready`
- `via-animated-headline:resized`
- `via-animated-headline:started`
- `via-animated-headline:stopped`
- `via-animated-headline:word-replaced`

## License

Animated Headlines is open-sourced software licensed under the [MIT license](https://opensource.org/license/MIT).