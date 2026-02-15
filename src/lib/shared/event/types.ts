import type { SvelteMap } from 'svelte/reactivity'

export type Slot = { startsAt?: Temporal.PlainTime; endsAt?: Temporal.PlainTime; note?: string }
export const emptySlot: Slot = {}

export type OptionEntry = { hasTime: boolean; slots: Array<Slot> }
export const emptyEntry: OptionEntry = { hasTime: false, slots: [emptySlot] }

export type Options = SvelteMap<string, OptionEntry>
