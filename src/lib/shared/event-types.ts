import type { SvelteMap } from 'svelte/reactivity'

export const emptySlot = [] satisfies PartialSlot
export type PartialSlot = [startsAt?: Temporal.PlainTime, endsAt?: Temporal.PlainTime]
export type Options = SvelteMap<string, Array<PartialSlot>>
