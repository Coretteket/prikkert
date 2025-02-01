import { Temporal } from 'temporal-polyfill'

export const { Now, Instant, PlainDate, PlainTime, Duration } = Temporal

export type Instant = InstanceType<typeof Temporal.Instant>
export type PlainDate = InstanceType<typeof Temporal.PlainDate>
export type PlainTime = InstanceType<typeof Temporal.PlainTime>
export type Duration = InstanceType<typeof Temporal.Duration>
