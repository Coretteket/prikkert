import type { PlainTime } from '@/lib/temporal'
import type { SvelteMap } from 'svelte/reactivity'

export const emptySlot = [] satisfies PartialSlot
export type PartialSlot = [startsAt?: PlainTime, endsAt?: PlainTime]
export type Slot = [startsAt?: PlainTime, endsAt?: PlainTime]
export type Options = SvelteMap<string, Array<PartialSlot>>
