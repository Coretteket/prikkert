if (!('Temporal' in globalThis)) await import('temporal-polyfill/global')

export const Temporal = globalThis.Temporal
