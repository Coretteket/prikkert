/**
 * Because of this Webkit bug...
 * https://bugs.webkit.org/show_bug.cgi?id=242740
 *
 * ...this SvelteKit issue exists:
 * https://github.com/sveltejs/kit/issues/7805
 *
 * Therefore, dynamic import of polyfill only when needed is NOT possible.
 * So we import the polyfill for all browsers, adding 20kb gzipped to the bundle.
 *
 * Thanks, Safari!
 */

// if (!('Temporal' in globalThis)) await import('temporal-polyfill/global')

// export const Temporal = globalThis.Temporal

export { Temporal } from 'temporal-polyfill'
