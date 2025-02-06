import type { PlainDate, PlainTime } from '@/lib/temporal'
import type { SvelteMap } from 'svelte/reactivity'

export const emptySlot = { startsAt: undefined, endsAt: undefined }
export type Slot = { startsAt?: PlainTime; endsAt?: PlainTime }
export type Options = SvelteMap<PlainDate, Array<Slot>>
