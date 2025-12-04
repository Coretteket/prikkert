import type { SvelteMap } from 'svelte/reactivity'

import type { PlainTime } from '@/shared/temporal'

export const emptySlot = [] satisfies PartialSlot
export type PartialSlot = [startsAt?: PlainTime, endsAt?: PlainTime]
export type Slot = [startsAt?: PlainTime, endsAt?: PlainTime]
export type Options = SvelteMap<string, Array<PartialSlot>>
