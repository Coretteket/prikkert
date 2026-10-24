/**
Because of this Webkit bug...
https://bugs.webkit.org/show_bug.cgi?id=242740

...this SvelteKit issue exists:
https://github.com/sveltejs/kit/issues/7805

Safari 27 fixes the bug, but older supported Safari versions still need this workaround.
Therefore, dynamic import of the polyfill only when needed is not yet safe, so we import
it for all browsers, adding 20kb gzipped to the bundle. Revisit once Safari 27 is the
minimum supported Safari version.

Thanks, Safari!
*/

// if (!('Temporal' in globalThis)) await import('temporal-polyfill/global')

// export const Temporal = globalThis.Temporal

export { Temporal } from 'temporal-polyfill'
