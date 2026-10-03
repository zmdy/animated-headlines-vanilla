export const emit = (el: Element, id: string, detail?: any, cancelable = false) =>
  el.dispatchEvent(new CustomEvent(`via-animated-headline:${id}`, { bubbles: true, cancelable, detail }));

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The attribute as a number, or `fallback` when it is missing or not a number. */
export function numberAttribute(el: Element, name: string, fallback: number): number {
  const parsed = parseFloat(el.getAttribute(name) ?? '');

  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Boolean attribute that can be switched off with `name="false"`. */
export function flagAttribute(el: Element, name: string, fallback: boolean): boolean {
  return el.hasAttribute(name) ? el.getAttribute(name) !== 'false' : fallback;
}
