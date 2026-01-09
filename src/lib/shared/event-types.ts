import type { SvelteMap } from 'svelte/reactivity'

import type { Temporal } from './temporal'

export const emptySlot = [] satisfies PartialSlot
export type PartialSlot = [startsAt?: Temporal.PlainTime, endsAt?: Temporal.PlainTime]
export type Options = SvelteMap<string, Array<PartialSlot>>

export type SerializedSlot = [] | [string, string | null | undefined]
export type SerializedOption = [string, SerializedSlot[]]
